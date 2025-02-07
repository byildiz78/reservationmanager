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
        const { date } = req.query;


        const client = await pool.connect();

        try {
            let query = `
                SELECT 
                    r.reservation_id as id,
                    r.customer_name as "customerName",
                    r.customer_phone as "customerPhone",
                    r.reservation_date as "reservationDate",
                    r.reservation_time as "reservationTime",
                    r.party_size as "guestCount",
                    r.status,
                    r.specialnotes,
                    t.table_id as "tableId",
                    t.table_name as "tableName",
                    s.section_id as "sectionId",
                    s.section_name as "sectionName"
                FROM reservations r
                LEFT JOIN tables t ON r.table_id = t.table_id
                LEFT JOIN sections s ON t.section_id = s.section_id
            `;

            const params = [];

            if (date) {
                query += ` AND r.reservation_date = $2`;
                params.push(date);
            }

            query += ` ORDER BY r.reservation_date DESC, r.reservation_time DESC`;

            const result = await client.query(query, params);

            return res.status(200).json({ 
                success: true,
                data: result.rows
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error in reservations:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
