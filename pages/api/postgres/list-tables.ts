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
            // Masaları ve bağlı oldukları bölümleri getir
            const result = await client.query(`
                SELECT 
                    t.table_id,
                    t.table_name,
                    t.capacity as table_capacity,
                    t.status as table_status,
                    s.section_id,
                    s.section_name,
                    s.description as section_description,
                    s.is_smoking,
                    s.is_outdoor,
                    s.is_vip
                FROM tables t
                LEFT JOIN sections s ON t.section_id = s.section_id
                ORDER BY s.section_name, t.table_name
            `);

            return res.status(200).json({
                success: true,
                data: result.rows
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error in list-tables:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
