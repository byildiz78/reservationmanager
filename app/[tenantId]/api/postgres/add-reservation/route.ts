import { pool } from "@/lib/postgre";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { 
            branch_id,
            customer_name,
            customer_phone,
            customer_email,
            party_size,
            reservation_date,
            reservation_time,
            status,
            table_id,
            notes,
            specialnotes
        } = await request.json();

        if (!branch_id || !customer_name || !party_size || !reservation_date || !reservation_time) {
            return NextResponse.json({ 
                success: false, 
                error: 'Gerekli alanlar eksik' 
            }, { status: 400 });
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const result = await client.query(`
                INSERT INTO reservations (
                    branch_id,
                    customer_name,
                    customer_phone,
                    customer_email,
                    party_size,
                    reservation_date,
                    reservation_time,
                    status,
                    table_id,
                    notes,
                    specialnotes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `, [
                branch_id,
                customer_name,
                customer_phone,
                customer_email,
                party_size,
                reservation_date,
                reservation_time,
                status,
                table_id,
                notes,
                specialnotes
            ]);

            // Rezervasyon geçmişini kaydet
            await client.query(`
                INSERT INTO reservation_history (
                    reservation_id,
                    branch_id,
                    customer_name,
                    customer_phone,
                    customer_email,
                    party_size,
                    reservation_date,
                    reservation_time,
                    status,
                    table_id,
                    notes,
                    specialnotes,
                    action_type
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'CREATE')
            `, [
                result.rows[0].reservation_id,
                branch_id,
                customer_name,
                customer_phone,
                customer_email,
                party_size,
                reservation_date,
                reservation_time,
                status,
                table_id,
                notes,
                specialnotes
            ]);

            await client.query('COMMIT');

            return NextResponse.json({ 
                success: true, 
                data: result.rows[0] 
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Add Reservation Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: (error as Error).message 
        }, { status: 500 });
    }
}
