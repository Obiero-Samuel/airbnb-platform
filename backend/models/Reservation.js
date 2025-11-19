const { promiseConnection } = require('../config/database');

class Reservation {
  // Create new reservation
  static async create(reservationData) {
    const {
      guest_id, property_id, check_in, check_out, total_price, guests_count, special_requests
    } = reservationData;

    const sql = `INSERT INTO reservations 
                 (guest_id, property_id, check_in, check_out, total_price, guests_count, special_requests) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    const [result] = await promiseConnection.execute(sql, [
      guest_id, property_id, check_in, check_out, total_price, guests_count, special_requests
    ]);
    
    return result.insertId;
  }

  // Get reservation by ID
  static async findById(reservationId) {
    const sql = `
      SELECT r.*, p.title, p.location, p.image_url, 
             u.username as guest_name, u.email as guest_email,
             h.username as host_name, h.email as host_email
      FROM reservations r
      JOIN properties p ON r.property_id = p.property_id
      JOIN users u ON r.guest_id = u.user_id
      JOIN users h ON p.host_id = h.user_id
      WHERE r.reservation_id = ?
    `;
    const [rows] = await promiseConnection.execute(sql, [reservationId]);
    return rows[0];
  }

  // Get reservations by user ID
  static async findByUserId(userId, role = 'guest') {
    let sql = '';
    let params = [userId];

    if (role === 'guest') {
      sql = `
        SELECT r.*, p.title, p.location, p.image_url, u.username as host_name
        FROM reservations r
        JOIN properties p ON r.property_id = p.property_id
        JOIN users u ON p.host_id = u.user_id
        WHERE r.guest_id = ?
        ORDER BY r.created_at DESC
      `;
    } else if (role === 'host') {
      sql = `
        SELECT r.*, p.title, p.location, p.image_url, u.username as guest_name
        FROM reservations r
        JOIN properties p ON r.property_id = p.property_id
        JOIN users u ON r.guest_id = u.user_id
        WHERE p.host_id = ?
        ORDER BY r.created_at DESC
      `;
    }

    const [rows] = await promiseConnection.execute(sql, params);
    return rows;
  }

  // Update reservation status
  static async updateStatus(reservationId, status) {
    const sql = 'UPDATE reservations SET status = ? WHERE reservation_id = ?';
    const [result] = await promiseConnection.execute(sql, [status, reservationId]);
    return result.affectedRows > 0;
  }

  // Calculate total price
  static async calculateTotalPrice(propertyId, checkIn, checkOut, guestsCount) {
    // Get property price
    const sql = 'SELECT price_per_night FROM properties WHERE property_id = ?';
    const [rows] = await promiseConnection.execute(sql, [propertyId]);
    
    if (rows.length === 0) {
      throw new Error('Property not found');
    }

    const pricePerNight = parseFloat(rows[0].price_per_night);
    
    // Calculate number of nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    return pricePerNight * nights;
  }
}

module.exports = Reservation;