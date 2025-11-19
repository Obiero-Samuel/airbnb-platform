const { promiseConnection } = require('../config/database');

// Initialize database with schema
const initDatabase = async () => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../sql/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await promiseConnection.execute(statement);
      }
    }
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

module.exports = { initDatabase };