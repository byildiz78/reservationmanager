import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/postgre';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { reservationId } = req.query;

    if (!reservationId) {
        return res.status(400).json({ message: 'Reservation ID is required' });
    }

    try {
        // If only status is being updated, get existing reservation data first
        if (Object.keys(req.body).length === 1 && req.body.status) {
            const currentReservation = await pool.query(
                'SELECT * FROM reservations WHERE reservation_id = $1',
                [reservationId]
            );

            if (currentReservation.rows.length === 0) {
                return res.status(404).json({ message: 'Reservation not found' });
            }

            // Update only the status while keeping other fields unchanged
            const result = await pool.query(
                `UPDATE reservations
                 SET status = $1
                 WHERE reservation_id = $2
                 RETURNING *`,
                [req.body.status, reservationId]
            );

            return res.status(200).json({ 
                success: true,
                message: 'Reservation status updated successfully',
                data: result.rows[0]
            });
        }

        // Full update with all fields
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

        // First, get the current reservation to check if it exists
        const checkResult = await pool.query(
            'SELECT reservation_id FROM reservations WHERE reservation_id = $1',
            [reservationId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Update the reservation with timezone handling
        const result = await pool.query(
            `UPDATE reservations
             SET customer_name = $1,
                 customer_phone = $2,
                 customer_email = $3,
                 party_size = $4,
                 reservation_date = $5::date,
                 reservation_time = $6::time,
                 table_id = $7,
                 notes = $8,
                 specialnotes = $9,
                 branch_id = $10,
                 status = $11
             WHERE reservation_id = $12
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
                customer_name,
                customer_phone,
                customer_email,
                party_size,
                reservation_date,
                reservation_time,
                table_id,
                notes,
                specialnotes,
                branch_id,
                status,
                reservationId
            ]
        );

        return res.status(200).json({ 
            success: true,
            message: 'Reservation updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating reservation:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error updating reservation',
            error: error.message 
        });
    }
}
