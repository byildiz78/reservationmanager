import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from "@/lib/postgre";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { 
            reservation_id,
            customer_name,
            customer_phone,
            customer_email,
            party_size,
            reservation_date,
            reservation_time,
            status,
            table_id,
            notes,
            specialnotes
        } = req.body;

        if (!reservation_id) {
            return res.status(400).json({ 
                success: false, 
                error: 'Reservation ID gerekli' 
            });
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const result = await client.query(`
                UPDATE reservations 
                SET 
                    customer_name = COALESCE($1, customer_name),
                    customer_phone = COALESCE($2, customer_phone),
                    customer_email = COALESCE($3, customer_email),
                    party_size = COALESCE($4, party_size),
                    reservation_date = COALESCE($5, reservation_date),
                    reservation_time = COALESCE($6, reservation_time),
                    status = COALESCE($7, status),
                    table_id = COALESCE($8, table_id),
                    notes = COALESCE($9, notes),
                    specialnotes = COALESCE($10, specialnotes)
                WHERE reservation_id = $11
                RETURNING *
            `, [
                customer_name,
                customer_phone,
                customer_email,
                party_size,
                reservation_date,
                reservation_time,
                status,
                table_id,
                notes,
                specialnotes,
                reservation_id
            ]);

            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    error: 'Rezervasyon bulunamadı'
                });
            }

            await client.query('COMMIT');

            return res.status(200).json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error in update-reservation:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
