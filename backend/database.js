
const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function getConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("Connected to MariaDB!");
    return conn;
  } catch (err) {
    console.error("Not connected due to error: " + err);
    throw err;
  }
}

module.exports = {
  getConnection
};
