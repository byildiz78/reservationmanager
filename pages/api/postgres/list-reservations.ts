import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from "@/lib/postgre";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { date, status, section } = req.query;

    try {
        const client = await pool.connect();

        try {
            // Build the WHERE clause based on filters
            const conditions = ['1=1']; // Always true condition to start with
            const params: any[] = [];
            let paramCount = 1;

            if (date) {
                conditions.push(`DATE(r.reservation_date) = $${paramCount}`);
                params.push(date);
                paramCount++;
            }

            if (status) {
                conditions.push(`r.status = $${paramCount}`);
                params.push(status);
                paramCount++;
            }

            if (section) {
                conditions.push(`s.section_name = $${paramCount}`);
                params.push(section);
                paramCount++;
            }

            const query = `
                SELECT 
                    r.reservation_id as id,
                    r.customer_name as "customerName",
                    r.customer_email as email,
                    r.customer_phone as phone,
                    TO_CHAR(r.reservation_date, 'YYYY-MM-DD') as date,
                    r.reservation_time as time,
                    r.party_size as persons,
                    t.table_name as "tableName",
                    t.capacity as "tableCapacity",
                    s.section_name as section,
                    tc.category_name as "tableCategory",
                    r.status,
                    r.notes,
                    r.specialnotes
                FROM reservations r
                LEFT JOIN tables t ON r.table_id = t.table_id
                LEFT JOIN sections s ON t.section_id = s.section_id
                LEFT JOIN table_categories tc ON t.category_id = tc.category_id
                WHERE ${conditions.join(' AND ')}
                ORDER BY r.reservation_date DESC, r.reservation_time DESC
            `;

            const result = await client.query(query, params);

            res.status(200).json({
                success: true,
                data: result.rows.map(row => ({
                    ...row,
                    status: row.status || 'pending' // Default status if null
                }))
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
