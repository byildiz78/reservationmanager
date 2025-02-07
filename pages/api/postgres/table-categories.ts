import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from "@/lib/postgre";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const client = await pool.connect();

        try {
            const result = await client.query(`
                SELECT 
                    category_id,
                    category_name,
                    min_capacity,
                    max_capacity
                FROM table_categories
                ORDER BY category_name
            `);

            return res.status(200).json({
                success: true,
                data: result.rows
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error in table-categories:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
