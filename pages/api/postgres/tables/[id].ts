import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from "@/lib/postgre";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'PUT') {
        try {
            const { id } = req.query;
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
                reservation_interval
            } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Table ID is required'
                });
            }

            const client = await pool.connect();

            try {
                const result = await client.query(`
                    UPDATE tables 
                    SET 
                        table_name = $1,
                        capacity = $2,
                        status = $3,
                        location = $4,
                        is_active = $5,
                        section_id = $6,
                        category_id = $7,
                        min_reservation_time = $8,
                        max_reservation_time = $9,
                        reservation_interval = $10,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE table_id = $11
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
                    id
                ]);

                if (result.rowCount === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Table not found'
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: result.rows[0]
                });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error in update table:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Table ID is required'
                });
            }

            const client = await pool.connect();

            try {
                const result = await client.query(`
                    DELETE FROM tables 
                    WHERE table_id = $1
                    RETURNING *
                `, [id]);

                if (result.rowCount === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Table not found'
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: result.rows[0]
                });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error in delete table:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    } else {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}
