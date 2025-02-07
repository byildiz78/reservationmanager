import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from "@/lib/postgre";
import { format } from "date-fns";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const search = req.query.search as string;
    const offset = (page - 1) * pageSize;

    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            error: "startDate and endDate parameters are required"
        });
    }

    try {
        const client = await pool.connect();

        try {
            // Build the search condition
            const searchCondition = search
                ? `AND (
                    LOWER(r.customer_name) LIKE LOWER($3) OR
                    r.customer_phone LIKE $3 OR
                    LOWER(t.table_name) LIKE LOWER($3) OR
                    LOWER(s.section_name) LIKE LOWER($3)
                )`
                : '';

            // Count total rows for pagination
            const countQuery = await client.query(`
                SELECT COUNT(*) as total
                FROM reservations r
                LEFT JOIN tables t ON r.table_id = t.table_id
                LEFT JOIN sections s ON t.section_id = s.section_id
                WHERE DATE(r.reservation_date) BETWEEN $1 AND $2
                ${searchCondition}
            `, search ? [startDate, endDate, `%${search}%`] : [startDate, endDate]);

            // Get paginated results
            const result = await client.query(`
                SELECT 
                    r.reservation_id as id,
                    r.customer_name,
                    r.customer_phone,
                    r.customer_email,
                    r.party_size,
                    TO_CHAR(r.reservation_date, 'YYYY-MM-DD') as reservation_date,
                    r.reservation_time,
                    r.table_id,
                    t.table_name,
                    t.capacity as table_capacity,
                    s.section_name,
                    r.status,
                    r.notes,
                    r.specialnotes,
                    s.is_smoking,
                    s.is_outdoor
                FROM reservations r
                LEFT JOIN tables t ON r.table_id = t.table_id
                LEFT JOIN sections s ON t.section_id = s.section_id
                WHERE DATE(r.reservation_date) BETWEEN $1 AND $2
                ${searchCondition}
                ORDER BY r.reservation_date ASC, r.reservation_time ASC
                LIMIT $${search ? '4' : '3'} OFFSET $${search ? '5' : '4'}
            `, search 
                ? [startDate, endDate, `%${search}%`, pageSize, offset]
                : [startDate, endDate, pageSize, offset]
            );

            res.status(200).json({
                success: true,
                data: {
                    reservations: result.rows,
                    pagination: {
                        total: parseInt(countQuery.rows[0].total),
                        page,
                        pageSize,
                        totalPages: Math.ceil(parseInt(countQuery.rows[0].total) / pageSize)
                    }
                }
            });

        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch reservations"
        });
    }
}
