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
            table_id,
            table_name,
            capacity,
            status,
            section_id,
            category_id
        } = req.body;

        if (!table_id) {
            return res.status(400).json({
                success: false,
                error: 'Table ID is required'
            });
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const result = await client.query(`
                UPDATE tables 
                SET 
                    table_name = COALESCE($1, table_name),
                    capacity = COALESCE($2, capacity),
                    status = COALESCE($3, status),
                    section_id = COALESCE($4, section_id),
                    category_id = COALESCE($5, category_id)
                WHERE table_id = $6
                RETURNING *
            `, [
                table_name,
                capacity,
                status,
                section_id,
                category_id,
                table_id
            ]);

            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    error: 'Table not found'
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
        console.error('Error in update-table:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
