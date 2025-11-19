const { promiseConnection } = require('../config/database');

class Property {
  // Create new property
  static async create(propertyData) {
    const {
      host_id, title, description, property_type, price_per_night,
      location, bedrooms, bathrooms, max_guests, amenities, image_url
    } = propertyData;

    const sql = `INSERT INTO properties 
                 (host_id, title, description, property_type, price_per_night, location, 
                  bedrooms, bathrooms, max_guests, amenities, image_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const [result] = await promiseConnection.execute(sql, [
      host_id, title, description, property_type, price_per_night, location,
      bedrooms, bathrooms, max_guests, JSON.stringify(amenities), image_url
    ]);
    
    return result.insertId;
  }

  // Get all properties with filters
  static async findAll(filters = {}) {
    let sql = `
      SELECT p.*, u.username as host_name, u.email as host_email 
      FROM properties p 
      LEFT JOIN users u ON p.host_id = u.user_id 
      WHERE 1=1
    `;
    const params = [];

    if (filters.property_type) {
      sql += ' AND p.property_type = ?';
      params.push(filters.property_type);
    }

    if (filters.min_price) {
      sql += ' AND p.price_per_night >= ?';
      params.push(filters.min_price);
    }

    if (filters.max_price) {
      sql += ' AND p.price_per_night <= ?';
      params.push(filters.max_price);
    }

    if (filters.location) {
      sql += ' AND p.location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.is_available !== undefined) {
      sql += ' AND p.is_available = ?';
      params.push(filters.is_available);
    }

    sql += ' ORDER BY p.created_at DESC';

    const [rows] = await promiseConnection.execute(sql, params);
    return rows;
  }

  // Get property by ID
  static async findById(propertyId) {
    const sql = `
      SELECT p.*, u.username as host_name, u.email as host_email, u.phone as host_phone 
      FROM properties p 
      LEFT JOIN users u ON p.host_id = u.user_id 
      WHERE p.property_id = ?
    `;
    const [rows] = await promiseConnection.execute(sql, [propertyId]);
    return rows[0];
  }

  // Get popular stays
  static async getPopularStays() {
    const sql = `
      SELECT p.*, u.username as host_name,
             COUNT(r.reservation_id) as booking_count
      FROM properties p 
      LEFT JOIN users u ON p.host_id = u.user_id 
      LEFT JOIN reservations r ON p.property_id = r.property_id 
      WHERE p.is_popular = TRUE OR p.rating >= 4.0
      GROUP BY p.property_id 
      ORDER BY p.rating DESC, booking_count DESC 
      LIMIT 10
    `;
    const [rows] = await promiseConnection.execute(sql);
    return rows;
  }

  // Update property
  static async update(propertyId, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(propertyId);
    const sql = `UPDATE properties SET ${fields.join(', ')} WHERE property_id = ?`;
    
    const [result] = await promiseConnection.execute(sql, values);
    return result.affectedRows > 0;
  }

  // Check property availability
  static async checkAvailability(propertyId, checkIn, checkOut) {
    const sql = `
      SELECT COUNT(*) as overlapping_reservations 
      FROM reservations 
      WHERE property_id = ? 
        AND status IN ('confirmed', 'pending')
        AND ((check_in BETWEEN ? AND ?) OR (check_out BETWEEN ? AND ?))
    `;
    
    const [rows] = await promiseConnection.execute(sql, [
      propertyId, checkIn, checkOut, checkIn, checkOut
    ]);
    
    return rows[0].overlapping_reservations === 0;
  }
}

module.exports = Property;