import { createPool } from 'mysql2/promise';

export const pool = createPool({
  host: 'localhost',
  port: 3306,
  user: 'root', 
  password: '',
  database: 'web-tech-2', 
  waitForConnections: true,
  connectionLimit: 10,
});