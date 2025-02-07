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
                    SELECT * FROM sections
                    ORDER BY section_name
                `);

                return res.status(200).json({
                    success: true,
                    data: result.rows
                });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error in get sections:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    } else if (req.method === 'POST') {
        try {
            const {
                section_name,
                description,
                capacity,
                is_smoking,
                is_outdoor,
                is_active
            } = req.body;

            if (!section_name) {
                return res.status(400).json({
                    success: false,
                    error: 'Section name is required'
                });
            }

            const client = await pool.connect();

            try {
                const result = await client.query(`
                    INSERT INTO sections (
                        section_name,
                        description,
                        capacity,
                        is_smoking,
                        is_outdoor,
                        is_active
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                `, [
                    section_name,
                    description,
                    capacity,
                    is_smoking,
                    is_outdoor,
                    is_active
                ]);

                return res.status(201).json({
                    success: true,
                    data: result.rows[0]
                });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error in create section:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    } else {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}
