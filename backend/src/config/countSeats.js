const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/criceco/backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM Seats;');
    console.log(`CURRENT SEAT COUNT: ${res.rows[0].count}`);
    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
