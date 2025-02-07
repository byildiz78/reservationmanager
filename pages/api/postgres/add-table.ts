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
            table_name,
            capacity,
            status,
            section_id,
            category_id
        } = req.body;

        if (!table_name || !capacity || !section_id || !category_id) {
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
                    section_id,
                    category_id
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [
                table_name,
                capacity,
                status,
                section_id,
                category_id
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
        console.error('Error in add-table:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
