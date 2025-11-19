const { promiseConnection } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static async create(userData) {
    const { username, email, password, first_name, last_name, phone } = userData;
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const sql = `INSERT INTO users (username, email, password_hash, first_name, last_name, phone) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    const [result] = await promiseConnection.execute(sql, [
      username, email, passwordHash, first_name, last_name, phone
    ]);
    
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await promiseConnection.execute(sql, [email]);
    return rows[0];
  }

  // Find user by username
  static async findByUsername(username) {
    const sql = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await promiseConnection.execute(sql, [username]);
    return rows[0];
  }

  // Find user by ID
  static async findById(userId) {
    const sql = 'SELECT user_id, username, email, first_name, last_name, phone, role, created_at FROM users WHERE user_id = ?';
    const [rows] = await promiseConnection.execute(sql, [userId]);
    return rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user verification status
  static async markAsVerified(userId) {
    const sql = 'UPDATE users SET is_verified = TRUE WHERE user_id = ?';
    await promiseConnection.execute(sql, [userId]);
  }
}

module.exports = User;