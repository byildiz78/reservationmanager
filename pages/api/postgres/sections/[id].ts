import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from "@/lib/postgre";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'PUT') {
        try {
            const { id } = req.query; // URL'den otomatik olarak alınacak
            const {
                section_name,
                description,
                capacity,
                is_smoking,
                is_outdoor,
                is_vip,
                is_active,
                order_number,
                branch_id
            } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Section ID is required'
                });
            }

            const client = await pool.connect();

            try {
                const result = await client.query(`
                    UPDATE sections 
                    SET 
                        section_name = $1,
                        description = $2,
                        capacity = $3,
                        is_smoking = $4,
                        is_outdoor = $5,
                        is_vip = $6,
                        is_active = $7,
                        order_number = $8,
                        branch_id = $9,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE section_id = $10
                    RETURNING *
                `, [
                    section_name,
                    description,
                    capacity,
                    is_smoking,
                    is_outdoor,
                    is_vip,
                    is_active,
                    order_number,
                    branch_id,
                    id
                ]);

                if (result.rowCount === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Section not found'
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
            console.error('Error in update section:', error);
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
                    error: 'Section ID is required'
                });
            }

            const client = await pool.connect();

            try {
                const result = await client.query(`
                    DELETE FROM sections 
                    WHERE section_id = $1
                    RETURNING *
                `, [id]);

                if (result.rowCount === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Section not found'
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
            console.error('Error in delete section:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    } else {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}
