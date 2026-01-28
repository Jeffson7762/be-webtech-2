import { Hono } from 'hono';
import mysql from 'mysql2';
// Create Hono app instance
const app = new Hono();
// Set up MySQL connection (MariaDB compatible)
const pool = mysql.createPool({
    host: '127.0.0.1', // Database host
    user: 'root', // Your MySQL username
    password: '', // Your MySQL password
    database: 'web-tech-2', // Your database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// Promisify the connection to make it easier to work with async/await
const promisePool = pool.promise();
// Define the /students route to get all students
app.get('/students', async (c) => {
    try {
        // Fetch students from the database
        const [rows] = await promisePool.query('SELECT * FROM students');
        return c.json(rows); // Respond with the rows from the query
    }
    catch (error) {
        console.error('Database query error:', error);
        return c.json({ error: 'Database query failed' }, 500);
    }
});
// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
