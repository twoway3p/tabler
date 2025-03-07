const sql = require('mssql');
require('dotenv').config();

// SQL Server configuration
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: false // change to true for local dev / self-signed certs
  }
};

/**
 * Execute a SQL query and return the result
 * @param {string} query - SQL query to execute
 * @param {Array} params - Parameters for the query (optional)
 * @returns {Promise<Array>} - Query results
 */
async function executeQuery(query, params = []) {
  try {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();
    
    // Add parameters to the request
    params.forEach((param, index) => {
      request.input(`param${index}`, param);
    });
    
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  } finally {
    sql.close();
  }
}

/**
 * Get a single record by ID
 * @param {string} table - Table name
 * @param {number} id - Record ID
 * @returns {Promise<Object>} - Single record
 */
async function getById(table, id) {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM ${table} WHERE id = @id`);
    
    return result.recordset[0];
  } catch (err) {
    console.error(`Error getting ${table} by ID:`, err);
    throw err;
  } finally {
    sql.close();
  }
}

/**
 * Get all records from a table
 * @param {string} table - Table name
 * @returns {Promise<Array>} - All records
 */
async function getAll(table) {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query(`SELECT * FROM ${table}`);
    return result.recordset;
  } catch (err) {
    console.error(`Error getting all records from ${table}:`, err);
    throw err;
  } finally {
    sql.close();
  }
}

/**
 * Insert a new record
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<Object>} - Inserted record
 */
async function insert(table, data) {
  try {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();
    
    // Build column names and parameter placeholders
    const columns = Object.keys(data).join(', ');
    const paramNames = Object.keys(data).map(key => `@${key}`).join(', ');
    
    // Add parameters to the request
    Object.entries(data).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    const query = `
      INSERT INTO ${table} (${columns})
      OUTPUT INSERTED.*
      VALUES (${paramNames})
    `;
    
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error(`Error inserting into ${table}:`, err);
    throw err;
  } finally {
    sql.close();
  }
}

/**
 * Update a record by ID
 * @param {string} table - Table name
 * @param {number} id - Record ID
 * @param {Object} data - Data to update
 * @returns {Promise<Object>} - Updated record
 */
async function update(table, id, data) {
  try {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();
    
    // Build SET clause for update
    const setClause = Object.keys(data)
      .map(key => `${key} = @${key}`)
      .join(', ');
    
    // Add parameters to the request
    Object.entries(data).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    // Add ID parameter
    request.input('id', sql.Int, id);
    
    const query = `
      UPDATE ${table}
      SET ${setClause}, updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id
    `;
    
    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    console.error(`Error updating ${table}:`, err);
    throw err;
  } finally {
    sql.close();
  }
}

/**
 * Delete a record by ID
 * @param {string} table - Table name
 * @param {number} id - Record ID
 * @returns {Promise<boolean>} - Success status
 */
async function deleteById(table, id) {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM ${table} WHERE id = @id`);
    
    return result.rowsAffected[0] > 0;
  } catch (err) {
    console.error(`Error deleting from ${table}:`, err);
    throw err;
  } finally {
    sql.close();
  }
}

// Test database connection
async function testConnection() {
  try {
    await sql.connect(sqlConfig);
    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  } finally {
    sql.close();
  }
}

module.exports = {
  executeQuery,
  getById,
  getAll,
  insert,
  update,
  deleteById,
  testConnection
}; 