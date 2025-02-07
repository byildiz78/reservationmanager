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
                    s.section_id,
                    s.section_name,
                    s.description,
                    s.capacity,
                    s.is_smoking,
                    s.is_outdoor,
                    s.is_active,
                    json_agg(
                        json_build_object(
                            'table_id', t.table_id,
                            'table_name', t.table_name,
                            'capacity', t.capacity,
                            'status', t.status,
                            'shape', CASE 
                                WHEN tc.category_name LIKE '%Kare%' THEN 'square'
                                WHEN tc.category_name LIKE '%Yuvarlak%' THEN 'circle'
                                ELSE 'rectangle'
                            END,
                            'position', json_build_object('x', 10, 'y', 10),
                            'size', json_build_object(
                                'width', CASE WHEN t.capacity <= 4 THEN 100 ELSE 150 END,
                                'height', CASE WHEN t.capacity <= 4 THEN 100 ELSE 100 END
                            ),
                            'category_name', tc.category_name,
                            'min_capacity', tc.min_capacity,
                            'max_capacity', tc.max_capacity,
                            'reservation_status', COALESCE(
                                (SELECT 
                                    CASE 
                                        WHEN COUNT(*) > 0 AND MIN(r.status) = 'confirmed' THEN 'reserved'
                                        WHEN COUNT(*) > 0 AND MIN(r.status) = 'completed' THEN 'occupied'
                                        ELSE 'available'
                                    END
                                FROM reservations r 
                                WHERE r.table_id = t.table_id 
                                AND r.reservation_date = CURRENT_DATE
                                AND r.status IN ('confirmed', 'completed')),
                                'available'
                            )
                        )
                        ORDER BY t.table_name
                    ) as tables
                FROM sections s
                LEFT JOIN tables t ON t.section_id = s.section_id
                LEFT JOIN table_categories tc ON t.category_id = tc.category_id
                GROUP BY 
                    s.section_id,
                    s.section_name,
                    s.description,
                    s.capacity,
                    s.is_smoking,
                    s.is_outdoor,
                    s.is_active
                ORDER BY s.section_name;
            `);

            return res.status(200).json({
                success: true,
                data: result.rows
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error in list-sections:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
