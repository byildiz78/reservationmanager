import { pool } from "@/lib/postgre";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const date = searchParams.get('date');

        if (!tenantId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Branch ID gerekli' 
            }, { status: 400 });
        }

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
                WHERE r.branch_id = $1
            `;

            const params = [tenantId];

            if (date) {
                query += ` AND r.reservation_date = $2`;
                params.push(date);
            }

            query += ` ORDER BY r.reservation_date DESC, r.reservation_time DESC`;

            const result = await client.query(query, params);

            return NextResponse.json({ 
                success: true, 
                data: result.rows 
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Get Reservations Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: (error as Error).message 
        }, { status: 500 });
    }
}
