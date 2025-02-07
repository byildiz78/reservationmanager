import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/postgre';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { 
            branch_id = 1,
            customer_name,
            customer_phone,
            customer_email = '',
            party_size,
            reservation_date,
            reservation_time,
            table_id,
            notes = '',
            specialnotes = '',
            status = 'pending'
        } = req.body;

        // Validate required fields
        if (!customer_name || !party_size || !reservation_date || !reservation_time || !table_id) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields' 
            });
        }

        // Create the reservation
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
                notes,
                specialnotes,
                status
            ) VALUES ($1, $2, $3, $4, $5, $6::date, $7::time, $8, $9, $10, $11)
            RETURNING 
                reservation_id,
                customer_name,
                customer_phone,
                customer_email,
                party_size,
                TO_CHAR(reservation_date, 'YYYY-MM-DD') as reservation_date,
                reservation_time::text,
                table_id,
                notes,
                specialnotes,
                branch_id,
                status`,
            [
                branch_id,
                customer_name,
                customer_phone,
                customer_email,
                party_size,
                reservation_date,
                reservation_time,
                table_id,
                notes,
                specialnotes,
                status
            ]
        );

        return res.status(201).json({ 
            success: true,
            message: 'Reservation created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error creating reservation',
            error: error.message 
        });
    }
}
