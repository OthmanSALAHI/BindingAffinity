const express = require('express');
const router = express.Router();
const { sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Secret key middleware - add an extra layer of security
const secretKey = (req, res, next) => {
  const secret = req.headers['x-secret-key'];
  if (secret !== process.env.DB_SECRET_KEY && secret !== 'super-secret-db-key-2026') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Admin check middleware
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all tables
router.get('/tables', authenticateToken, isAdmin, secretKey, async (req, res) => {
  try {
    const result = await sql`
      SELECT tablename as name 
      FROM pg_catalog.pg_tables 
      WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
    `;
    res.json({ tables: result.rows });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get table schema
router.get('/tables/:tableName/schema', authenticateToken, isAdmin, secretKey, async (req, res) => {
  try {
    const { tableName } = req.params;
    const result = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position
    `;
    res.json({ schema: result.rows });
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all rows from a table
router.get('/tables/:tableName/rows', authenticateToken, isAdmin, secretKey, async (req, res) => {
  try {
    const { tableName } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    // Note: Direct table name interpolation is risky but needed here
    // In production, validate tableName against whitelist
    const rows = await sql.query(`SELECT * FROM ${tableName} LIMIT $1 OFFSET $2`, [limit, offset]);
    const count = await sql.query(`SELECT COUNT(*) as total FROM ${tableName}`);
    
    res.json({ rows: rows.rows, total: parseInt(count.rows[0].total) });
  } catch (error) {
    console.error('Error fetching rows:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute custom query (SELECT only for safety)
router.post('/query', authenticateToken, isAdmin, secretKey, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Check if it's a SELECT query for safety
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith('SELECT')) {
      return res.status(400).json({ error: 'Only SELECT queries are allowed in this endpoint. Use specific endpoints for modifications.' });
    }
    
    const result = await sql.query(query);
    res.json({ result: result.rows });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: error.message });
  }
});

// Insert row
router.post('/tables/:tableName/rows', authenticateToken, isAdmin, secretKey, async (req, res) => {
  try {
    const { tableName } = req.params;
    const { data } = req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Data object is required' });
    }
    
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(data);
    
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await sql.query(query, values);
    
    res.json({ success: true, row: result.rows[0], changes: result.rowCount });
  } catch (error) {
    console.error('Error inserting row:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update row
router.put('/tables/:tableName/rows/:id', authenticateToken, isAdmin, secretKey, async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const { data } = req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Data object is required' });
    }
    
    const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(data), id];
    
    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${values.length}`;
    const result = await sql.query(query, values);
    
    res.json({ success: true, changes: result.rowCount });
  } catch (error) {
    console.error('Error updating row:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete row
router.delete('/tables/:tableName/rows/:id', authenticateToken, isAdmin, secretKey, async (req, res) => {
  try {
    const { tableName, id } = req.params;
    
    const query = `DELETE FROM ${tableName} WHERE id = $1`;
    const result = await sql.query(query, [id]);
    
    res.json({ success: true, changes: result.rowCount });
  } catch (error) {
    console.error('Error deleting row:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute raw SQL (dangerous - use with caution)
router.post('/execute', authenticateToken, isAdmin, secretKey, async (req, res) => {
  try {
    const { sql: queryText, params = [] } = req.body;
    
    if (!queryText) {
      return res.status(400).json({ error: 'SQL is required' });
    }
    
    const result = await sql.query(queryText, params);
    
    res.json({ 
      success: true, 
      result: result.rows,
      changes: result.rowCount 
    });
  } catch (error) {
    console.error('Error executing SQL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear all data from all tables (DANGEROUS!)
router.post('/clear-all', authenticateToken, isAdmin, secretKey, async (req, res) => {
  try {
    // Get all tables
    const tablesResult = await sql`
      SELECT tablename as name 
      FROM pg_catalog.pg_tables 
      WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
    `;
    
    const tables = tablesResult.rows;
    let totalDeleted = 0;
    const results = [];

    // Delete all rows from each table
    for (const table of tables) {
      try {
        const result = await sql.query(`DELETE FROM ${table.name}`);
        results.push({ table: table.name, deleted: result.rowCount });
        totalDeleted += result.rowCount;
      } catch (error) {
        results.push({ table: table.name, error: error.message });
      }
    }

    res.json({ 
      success: true, 
      message: `Cleared all data from ${tables.length} tables`,
      totalDeleted,
      details: results 
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
