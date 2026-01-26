const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
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
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all tables
router.get('/tables', authenticateToken, isAdmin, secretKey, (req, res) => {
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    res.json({ tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get table schema
router.get('/tables/:tableName/schema', authenticateToken, isAdmin, secretKey, (req, res) => {
  try {
    const { tableName } = req.params;
    const schema = db.prepare(`PRAGMA table_info(${tableName})`).all();
    res.json({ schema });
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all rows from a table
router.get('/tables/:tableName/rows', authenticateToken, isAdmin, secretKey, (req, res) => {
  try {
    const { tableName } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    const rows = db.prepare(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`).all(limit, offset);
    const count = db.prepare(`SELECT COUNT(*) as total FROM ${tableName}`).get();
    
    res.json({ rows, total: count.total });
  } catch (error) {
    console.error('Error fetching rows:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute custom query (SELECT only for safety)
router.post('/query', authenticateToken, isAdmin, secretKey, (req, res) => {
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
    
    const result = db.prepare(query).all();
    res.json({ result });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: error.message });
  }
});

// Insert row
router.post('/tables/:tableName/rows', authenticateToken, isAdmin, secretKey, (req, res) => {
  try {
    const { tableName } = req.params;
    const { data } = req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Data object is required' });
    }
    
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const stmt = db.prepare(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`);
    const result = stmt.run(...values);
    
    res.json({ success: true, id: result.lastInsertRowid, changes: result.changes });
  } catch (error) {
    console.error('Error inserting row:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update row
router.put('/tables/:tableName/rows/:id', authenticateToken, isAdmin, secretKey, (req, res) => {
  try {
    const { tableName, id } = req.params;
    const { data } = req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Data object is required' });
    }
    
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    const stmt = db.prepare(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`);
    const result = stmt.run(...values);
    
    res.json({ success: true, changes: result.changes });
  } catch (error) {
    console.error('Error updating row:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete row
router.delete('/tables/:tableName/rows/:id', authenticateToken, isAdmin, secretKey, (req, res) => {
  try {
    const { tableName, id } = req.params;
    
    const stmt = db.prepare(`DELETE FROM ${tableName} WHERE id = ?`);
    const result = stmt.run(id);
    
    res.json({ success: true, changes: result.changes });
  } catch (error) {
    console.error('Error deleting row:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute raw SQL (dangerous - use with caution)
router.post('/execute', authenticateToken, isAdmin, secretKey, (req, res) => {
  try {
    const { sql, params = [] } = req.body;
    
    if (!sql) {
      return res.status(400).json({ error: 'SQL is required' });
    }
    
    const trimmedSql = sql.trim().toUpperCase();
    
    if (trimmedSql.startsWith('SELECT')) {
      const result = db.prepare(sql).all(...params);
      res.json({ success: true, result });
    } else {
      const result = db.prepare(sql).run(...params);
      res.json({ success: true, changes: result.changes, lastInsertRowid: result.lastInsertRowid });
    }
  } catch (error) {
    console.error('Error executing SQL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear all data from all tables (DANGEROUS!)
router.post('/clear-all', authenticateToken, isAdmin, secretKey, (req, res) => {
  try {
    // Get all tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    
    let totalDeleted = 0;
    const results = [];

    // Delete all rows from each table
    tables.forEach(table => {
      try {
        const result = db.prepare(`DELETE FROM ${table.name}`).run();
        results.push({ table: table.name, deleted: result.changes });
        totalDeleted += result.changes;
      } catch (error) {
        results.push({ table: table.name, error: error.message });
      }
    });

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
