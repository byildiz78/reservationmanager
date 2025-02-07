import { Pool, PoolClient } from 'pg';

// PostgreSQL bağlantısı havuzu
export const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  ssl: process.env.POSTGRES_SSL === 'true' ? {
    rejectUnauthorized: false
  } : undefined
});

// Bağlantı test fonksiyonu
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL bağlantısı başarılı');
    client.release();
    return true;
  } catch (error) {
    console.error('PostgreSQL bağlantı hatası:', error);
    return false;
  }
}

// Genel sorgu çalıştırma fonksiyonu
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Transaction işlemleri için yardımcı fonksiyon
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Rezervasyon tablosu için CRUD işlemleri
export const ReservationDB = {
  // Tüm rezervasyonları getir
  async getAll(filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    section?: string;
  }) {
    let queryText = `
      SELECT 
        r.*,
        t.name as table_name,
        t.section_id,
        s.name as section_name
      FROM reservations r
      LEFT JOIN tables t ON r.table_id = t.id
      LEFT JOIN sections s ON t.section_id = s.id
      WHERE 1=1
    `;
    const queryParams: any[] = [];

    if (filters?.startDate) {
      queryText += ` AND r.date >= $${queryParams.length + 1}`;
      queryParams.push(filters.startDate);
    }
    if (filters?.endDate) {
      queryText += ` AND r.date <= $${queryParams.length + 1}`;
      queryParams.push(filters.endDate);
    }
    if (filters?.status) {
      queryText += ` AND r.status = $${queryParams.length + 1}`;
      queryParams.push(filters.status);
    }
    if (filters?.section) {
      queryText += ` AND s.id = $${queryParams.length + 1}`;
      queryParams.push(filters.section);
    }

    queryText += ' ORDER BY r.date DESC, r.time ASC';
    
    return query(queryText, queryParams);
  },

  // Tek bir rezervasyon getir
  async getById(id: string) {
    const queryText = `
      SELECT 
        r.*,
        t.name as table_name,
        t.section_id,
        s.name as section_name
      FROM reservations r
      LEFT JOIN tables t ON r.table_id = t.id
      LEFT JOIN sections s ON t.section_id = s.id
      WHERE r.id = $1
    `;
    const result = await query(queryText, [id]);
    return result.rows[0];
  },

  // Yeni rezervasyon oluştur
  async create(reservation: {
    customer_name: string;
    date: Date;
    time: string;
    person_count: number;
    table_id: string;
    status: string;
    notes?: string;
  }) {
    return withTransaction(async (client) => {
      // Önce masanın müsaitliğini kontrol et
      const tableCheck = await client.query(
        `SELECT COUNT(*) FROM reservations 
         WHERE table_id = $1 
         AND date = $2 
         AND time = $3 
         AND status NOT IN ('cancelled', 'completed')`,
        [reservation.table_id, reservation.date, reservation.time]
      );

      if (parseInt(tableCheck.rows[0].count) > 0) {
        throw new Error('Bu masa ve zaman için başka bir rezervasyon mevcut');
      }

      const queryText = `
        INSERT INTO reservations (
          customer_name, date, time, person_count, 
          table_id, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const values = [
        reservation.customer_name,
        reservation.date,
        reservation.time,
        reservation.person_count,
        reservation.table_id,
        reservation.status,
        reservation.notes
      ];

      const result = await client.query(queryText, values);
      return result.rows[0];
    });
  },

  // Rezervasyon güncelle
  async update(id: string, updates: Partial<{
    customer_name: string;
    date: Date;
    time: string;
    person_count: number;
    table_id: string;
    status: string;
    notes: string;
  }>) {
    return withTransaction(async (client) => {
      // Eğer masa veya zaman değişiyorsa, yeni masanın müsaitliğini kontrol et
      if (updates.table_id || updates.date || updates.time) {
        const currentReservation = await client.query(
          'SELECT table_id, date, time FROM reservations WHERE id = $1',
          [id]
        );
        
        const tableId = updates.table_id || currentReservation.rows[0].table_id;
        const date = updates.date || currentReservation.rows[0].date;
        const time = updates.time || currentReservation.rows[0].time;

        const tableCheck = await client.query(
          `SELECT COUNT(*) FROM reservations 
           WHERE table_id = $1 
           AND date = $2 
           AND time = $3 
           AND id != $4
           AND status NOT IN ('cancelled', 'completed')`,
          [tableId, date, time, id]
        );

        if (parseInt(tableCheck.rows[0].count) > 0) {
          throw new Error('Bu masa ve zaman için başka bir rezervasyon mevcut');
        }
      }

      const fields = Object.keys(updates);
      const values = Object.values(updates);
      
      const queryText = `
        UPDATE reservations 
        SET ${fields.map((f, i) => `${f} = $${i + 1}`).join(', ')}
        WHERE id = $${fields.length + 1}
        RETURNING *
      `;
      
      const result = await client.query(queryText, [...values, id]);
      return result.rows[0];
    });
  },

  // Rezervasyon sil
  async delete(id: string) {
    const queryText = 'DELETE FROM reservations WHERE id = $1 RETURNING *';
    const result = await query(queryText, [id]);
    return result.rows[0];
  },

  // Belirli bir tarih için rezervasyonları getir
  async getByDate(date: Date) {
    const queryText = `
      SELECT 
        r.*,
        t.name as table_name,
        t.section_id,
        s.name as section_name
      FROM reservations r
      LEFT JOIN tables t ON r.table_id = t.id
      LEFT JOIN sections s ON t.section_id = s.id
      WHERE r.date = $1
      ORDER BY r.time ASC
    `;
    return query(queryText, [date]);
  },

  // Belirli bir masa için rezervasyonları getir
  async getByTable(tableId: string, date: Date) {
    const queryText = `
      SELECT * FROM reservations 
      WHERE table_id = $1 AND date = $2
      ORDER BY time ASC
    `;
    return query(queryText, [tableId, date]);
  }
};

// Gerekli PostgreSQL tabloları için migration sorguları
export const migrations = {
  async createTables() {
    await withTransaction(async (client) => {
      // Sections tablosu
      await client.query(`
        CREATE TABLE IF NOT EXISTS sections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          capacity INTEGER NOT NULL,
          description TEXT,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tables tablosu
      await client.query(`
        CREATE TABLE IF NOT EXISTS tables (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(50) NOT NULL,
          section_id UUID REFERENCES sections(id),
          capacity INTEGER NOT NULL,
          shape VARCHAR(20) NOT NULL,
          position_x INTEGER,
          position_y INTEGER,
          width INTEGER,
          height INTEGER,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Reservations tablosu
      await client.query(`
        CREATE TABLE IF NOT EXISTS reservations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          customer_name VARCHAR(100) NOT NULL,
          date DATE NOT NULL,
          time TIME NOT NULL,
          person_count INTEGER NOT NULL,
          table_id UUID REFERENCES tables(id),
          status VARCHAR(20) NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Updated_at için trigger fonksiyonu
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

      // Her tablo için updated_at trigger'ı
      for (const table of ['sections', 'tables', 'reservations']) {
        await client.query(`
          DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
          CREATE TRIGGER update_${table}_updated_at
            BEFORE UPDATE ON ${table}
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `);
      }
    });
  }
};