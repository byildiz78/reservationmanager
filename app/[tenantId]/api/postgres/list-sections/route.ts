import { pool } from "@/lib/postgre";
import { NextResponse } from "next/server";

export async function GET() {
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
                WHERE s.is_active = true
                GROUP BY s.section_id, s.section_name, s.description, s.capacity, s.is_smoking, s.is_outdoor, s.is_active
                ORDER BY s.order_number, s.section_name
            `);

            return NextResponse.json({ 
                success: true,
                data: result.rows.map(row => ({
                    id: row.section_id.toString(),
                    name: row.section_name,
                    capacity: row.capacity || 0,
                    description: row.description,
                    isSmoking: row.is_smoking,
                    isOutdoor: row.is_outdoor,
                    isActive: row.is_active,
                    tables: row.tables.filter(table => table.table_id !== null).map(table => ({
                        id: table.table_id.toString(),
                        name: table.table_name,
                        capacity: table.capacity,
                        status: table.status,
                        shape: table.shape,
                        position: table.position,
                        size: table.size,
                        reservationStatus: table.reservation_status,
                        category: {
                            name: table.category_name,
                            minCapacity: table.min_capacity,
                            maxCapacity: table.max_capacity
                        }
                    }))
                }))
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error("List Sections Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: (error as Error).message 
        }, { status: 500 });
    }
}
