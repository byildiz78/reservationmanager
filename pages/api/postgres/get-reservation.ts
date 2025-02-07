import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from "@/lib/postgre";

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
        r.reservation_id,
        r.table_id,
        r.branch_id,
        r.customer_name,
        r.customer_phone,
        r.customer_email,
        r.party_size,
        r.reservation_date,
        r.reservation_time,
        r.status,
        r.notes,
        r.created_at,
        r.updated_at,
        t.table_name,
        t.capacity as table_capacity,
        t.status as table_status,
        s.section_name,
        s.description as section_description,
        s.is_smoking,
        s.is_outdoor,
        s.is_vip
      FROM reservations r
      LEFT JOIN tables t ON r.table_id = t.table_id
      LEFT JOIN sections s ON t.section_id = s.section_id
      WHERE r.reservation_id = $1`,
      [reservationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const reservation = result.rows[0];
    return res.status(200).json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
