import { pool } from "@/lib/postgre";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    try {
        const { reservation_id, branch_id } = await request.json();

        if (!reservation_id || !branch_id) {
            return NextResponse.json({ 
                success: false, 
                error: 'Reservation ID ve Branch ID gerekli' 
            }, { status: 400 });
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Önce rezervasyonun var olduğunu kontrol et
            const checkResult = await client.query(
                'SELECT reservation_id FROM reservations WHERE reservation_id = $1 AND branch_id = $2',
                [reservation_id, branch_id]
            );

            if (checkResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({ 
                    success: false, 
                    error: 'Rezervasyon bulunamadı' 
                }, { status: 404 });
            }

            // Rezervasyon geçmişini kaydet
            await client.query(`
                INSERT INTO reservation_history (
                    reservation_id,
                    branch_id,
                    customer_name,
                    customer_phone,
                    reservation_date,
                    reservation_time,
                    guest_count,
                    status,
                    table_id,
                    specialnotes,
                    action_type
                ) SELECT 
                    reservation_id,
                    branch_id,
                    customer_name,
                    customer_phone,
                    reservation_date,
                    reservation_time,
                    guest_count,
                    status,
                    table_id,
                    specialnotes,
                    'DELETE'
                FROM reservations 
                WHERE reservation_id = $1
            `, [reservation_id]);

            // Rezervasyonu sil
            await client.query(
                'DELETE FROM reservations WHERE reservation_id = $1 AND branch_id = $2',
                [reservation_id, branch_id]
            );

            await client.query('COMMIT');

            return NextResponse.json({ 
                success: true 
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Delete Reservation Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: (error as Error).message 
        }, { status: 500 });
    }
}
