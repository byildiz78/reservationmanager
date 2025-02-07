import { NextResponse } from "next/server";
import { pool } from "@/lib/postgre";

export async function GET(
    request: Request,
    { params }: { params: { tenantId: string } }
) {
    try {
        const tenantId = params.tenantId;
        // Her zaman branchId'yi 1 olarak ayarla
        const branchId = 1;

        console.log('Tables API - Request parameters:', { tenantId, branchId });

        const client = await pool.connect();
        console.log('Tables API - DB connection successful');

        try {
            const query = `
                SELECT 
                    t.table_id,
                    t.table_name,
                    t.capacity,
                    t.status,
                    t.location,
                    t.is_active,
                    t.section_id,
                    t.category_id,
                    t.min_reservation_time,
                    t.max_reservation_time,
                    t.reservation_interval,
                    s.section_name,
                    s.is_smoking,
                    s.is_outdoor,
                    s.is_vip,
                    tc.category_name,
                    tc.price_category
                FROM tables t
                LEFT JOIN sections s ON t.section_id = s.section_id
                LEFT JOIN table_categories tc ON t.category_id = tc.category_id
                WHERE t.branch_id = $1
                ORDER BY t.table_name
            `;

            console.log('Executing query:', { query, branchId });
            const result = await client.query(query, [branchId]);
            console.log('Query result:', { 
                rowCount: result.rowCount,
                sampleRow: result.rows[0]
            });

            // Verileri düzenle ve null kontrolleri ekle
            const formattedData = result.rows.map(row => ({
                id: row.table_id,
                name: row.table_name || '',
                capacity: row.capacity || 0,
                status: row.status || 'available',
                location: row.location || '',
                isActive: row.is_active || false,
                sectionId: row.section_id,
                categoryId: row.category_id,
                minReservationTime: row.min_reservation_time || 60,
                maxReservationTime: row.max_reservation_time || 180,
                reservationInterval: row.reservation_interval || 15,
                section: row.section_id ? {
                    id: row.section_id,
                    name: row.section_name || '',
                    isSmoking: row.is_smoking || false,
                    isOutdoor: row.is_outdoor || false,
                    isVip: row.is_vip || false
                } : null,
                category: row.category_id ? {
                    id: row.category_id,
                    name: row.category_name || '',
                    priceCategory: row.price_category || ''
                } : null
            }));

            return NextResponse.json({ 
                success: true, 
                data: formattedData 
            });

        } catch (error: any) {
            console.error('Database query error:', {
                message: error.message,
                detail: error.detail,
                code: error.code,
                position: error.position,
                query: error.query,
                parameters: error.parameters
            });
            return NextResponse.json({ 
                success: false, 
                error: 'Database query failed',
                details: error.message
            }, { status: 500 });
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Database connection error:', {
            message: error.message,
            code: error.code
        });
        return NextResponse.json({ 
            success: false, 
            error: 'Database connection failed',
            details: error.message
        }, { status: 500 });
    }
}
