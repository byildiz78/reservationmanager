import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from "@/lib/postgre";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { reservation_id } = req.query;

        if (!reservation_id) {
            return res.status(400).json({ 
                success: false, 
                error: 'Reservation ID gerekli' 
            });
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const result = await client.query(`
                DELETE FROM reservations 
                WHERE reservation_id = $1
                RETURNING *
            `, [reservation_id]);

            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    error: 'Rezervasyon bulunamadı'
                });
            }

            await client.query('COMMIT');

            return res.status(200).json({
                success: true,
                message: 'Rezervasyon başarıyla silindi'
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error in delete-reservation:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
