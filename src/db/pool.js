const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: parseInt(process.env.DB_POOL_LIMIT, 10) || 10,
  connectTimeout: 10000,
});

/**
 * Execute a parameterized SQL query.
 * @param {string} sql  - SQL statement with ? placeholders
 * @param {Array}  params - values bound to placeholders
 * @returns {Promise<Array>} result rows
 */
async function query(sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(sql, params);
    // mariadb driver returns a meta field — strip it for plain arrays
    if (Array.isArray(rows)) {
      delete rows.meta;
    }
    return rows;
  } finally {
    if (conn) conn.release();
  }
}

/**
 * Run multiple queries inside a single transaction.
 * @param {Function} fn - async (conn) => { ... }
 * @returns {Promise<*>} whatever fn returns
 */
async function withTransaction(fn) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { pool, query, withTransaction };
