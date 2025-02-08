import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from "@/lib/postgre";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const client = await pool.connect();

            try {
                const result = await client.query(`
                    SELECT * FROM tables
                    ORDER BY table_name
                `);

                return res.status(200).json({
                    success: true,
                    data: result.rows
                });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error in get tables:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    } else if (req.method === 'POST') {
        try {
            const {
                table_name,
                capacity,
                status,
                location,
                is_active,
                section_id,
                category_id,
                min_reservation_time,
                max_reservation_time,
                reservation_interval,
                branch_id
            } = req.body;

            if (!table_name || !capacity || !section_id || !category_id || !branch_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Required fields are missing'
                });
            }

            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                const result = await client.query(`
                    INSERT INTO tables (
                        table_name,
                        capacity,
                        status,
                        location,
                        is_active,
                        section_id,
                        category_id,
                        min_reservation_time,
                        max_reservation_time,
                        reservation_interval,
                        branch_id
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    RETURNING *
                `, [
                    table_name,
                    capacity,
                    status,
                    location,
                    is_active,
                    section_id,
                    category_id,
                    min_reservation_time,
                    max_reservation_time,
                    reservation_interval,
                    branch_id
                ]);

                await client.query('COMMIT');

                return res.status(201).json({
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
            console.error('Error in create table:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    } else {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}
