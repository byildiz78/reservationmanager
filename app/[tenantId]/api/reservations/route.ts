import { NextResponse } from 'next/server';
import { ReservationDB } from '@/lib/postgre';

export async function GET() {
  try {
    const result = await ReservationDB.getAll();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Rezervasyonlar yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Rezervasyonlar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await ReservationDB.create(data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Rezervasyon oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Rezervasyon oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;
    const result = await ReservationDB.update(id, updates);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Rezervasyon güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Rezervasyon güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const result = await ReservationDB.delete(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Rezervasyon silinirken hata:', error);
    return NextResponse.json(
      { error: 'Rezervasyon silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
