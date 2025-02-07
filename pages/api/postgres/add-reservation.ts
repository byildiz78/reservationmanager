import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from "@/lib/postgre";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { 
            branch_id,
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

        if (!branch_id || !customer_name || !party_size || !reservation_date || !reservation_time) {
            return res.status(400).json({ 
                success: false, 
                error: 'Gerekli alanlar eksik' 
            });
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const result = await client.query(`
                INSERT INTO reservations (
                    branch_id,
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
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `, [
                branch_id,
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
            ]);

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
        console.error('Error in add-reservation:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
