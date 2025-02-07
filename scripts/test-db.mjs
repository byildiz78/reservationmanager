import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function testConnection() {
  const pool = new Pool({
    connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Trying to connect with config:', {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      ssl: true
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('PostgreSQL connection successful:', result.rows[0]);
    client.release();
    await pool.end();
  } catch (error) {
    console.error('PostgreSQL connection error:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  }
}

testConnection();
