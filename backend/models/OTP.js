const { promiseConnection } = require('../config/database');

class OTP {
  // Generate and save OTP
  static async generateOTP(userId, email) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    const sql = `INSERT INTO otp_verification (user_id, otp_code, email, expires_at) 
                 VALUES (?, ?, ?, ?)`;
    
    await promiseConnection.execute(sql, [userId, otpCode, email, expiresAt]);
    return otpCode;
  }

  // Verify OTP
  static async verifyOTP(userId, otpCode) {
    const sql = `SELECT * FROM otp_verification 
                 WHERE user_id = ? AND otp_code = ? AND is_used = FALSE AND expires_at > NOW()`;
    
    const [rows] = await promiseConnection.execute(sql, [userId, otpCode]);
    
    if (rows.length > 0) {
      // Mark OTP as used
      await promiseConnection.execute(
        'UPDATE otp_verification SET is_used = TRUE WHERE user_id = ? AND otp_code = ?',
        [userId, otpCode]
      );
      return true;
    }
    return false;
  }

  // Clean expired OTPs
  static async cleanExpiredOTPs() {
    await promiseConnection.execute('DELETE FROM otp_verification WHERE expires_at < NOW()');
  }
}

module.exports = OTP;