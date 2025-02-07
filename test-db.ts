import { testConnection } from './lib/postgre';

console.log('Testing database connection...');
console.log('Environment variables:', {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  ssl: process.env.POSTGRES_SSL
});

testConnection()
  .then(result => {
    console.log('Connection test result:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Connection test error:', error);
    process.exit(1);
  });
