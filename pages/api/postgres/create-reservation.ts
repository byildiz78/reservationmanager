import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/postgre';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      party_size,
      reservation_date,
      reservation_time,
      table_id,
      status = 'confirmed',
      notes = '',
      specialnotes = ''
    } = req.body;

    // Validate required fields
    if (!customer_name || !customer_phone || !reservation_date || !reservation_time || !table_id) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['customer_name', 'customer_phone', 'reservation_date', 'reservation_time', 'table_id']
      });
    }

    // Use default branch_id
    const branch_id = 1;

    // Insert the new reservation
    const result = await pool.query(
      `INSERT INTO reservations (
        branch_id,
        customer_name,
        customer_phone,
        customer_email,
        party_size,
        reservation_date,
        reservation_time,
        table_id,
        status,
        notes,
        specialnotes,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        branch_id,
        customer_name,
        customer_phone,
        customer_email,
        party_size,
        reservation_date,
        reservation_time,
        table_id,
        status,
        notes,
        specialnotes
      ]
    );

    console.log('Created reservation:', result.rows[0]);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating reservation:', error);
    return res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
}
