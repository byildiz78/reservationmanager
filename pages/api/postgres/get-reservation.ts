import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/postgre';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { reservationId } = req.query;

  if (!reservationId) {
    return res.status(400).json({ message: 'Reservation ID is required' });
  }

  try {
    const result = await pool.query(
      `SELECT 
        r.reservation_id as id,
        r.customer_name,
        r.customer_phone,
        r.customer_email,
        r.party_size,
        r.table_id as reservation_table_id,
        TO_CHAR(r.reservation_date, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as reservation_date,
        r.reservation_time,
        r.status,
        r.notes,
        r.specialnotes,
        r.is_smoking,
        r.is_outdoor,
        r.is_vip,
        -- Table data
        t.table_id,
        t.table_name,
        t.capacity as table_capacity,
        t.status as table_status,
        t.section_id as table_section_id,
        -- Section data
        s.section_id,
        s.name as section_name,
        s.description as section_description
      FROM reservations r
      LEFT JOIN tables t ON r.table_id = t.table_id
      LEFT JOIN sections s ON t.section_id = s.section_id
      WHERE r.reservation_id = $1`,
      [reservationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Transform the flat data into nested structure
    const row = result.rows[0];
    const tableId = row.table_id || row.reservation_table_id;
    const sectionId = row.section_id || row.table_section_id;

    const transformedData = {
      id: row.id,
      customer_name: row.customer_name,
      customer_phone: row.customer_phone,
      customer_email: row.customer_email,
      party_size: row.party_size,
      reservation_date: row.reservation_date,
      reservation_time: row.reservation_time,
      status: row.status,
      notes: row.notes,
      specialnotes: row.specialnotes,
      is_smoking: row.is_smoking,
      is_outdoor: row.is_outdoor,
      is_vip: row.is_vip,
      // Add flat IDs for backward compatibility
      table_id: tableId,
      section_id: sectionId,
      // Nested objects for new format
      table: tableId ? {
        table_id: tableId,
        table_name: row.table_name || '',
        table_capacity: row.table_capacity || 0,
        table_status: row.table_status || 'available'
      } : null,
      section: sectionId ? {
        id: sectionId,
        name: row.section_name || '',
        description: row.section_description || ''
      } : null
    };

    console.log('Transformed reservation data:', transformedData);
    return res.status(200).json(transformedData);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return res.status(500).json({ message: 'Error fetching reservation', error: error.message });
  }
}
