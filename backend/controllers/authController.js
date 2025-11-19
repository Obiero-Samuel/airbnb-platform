const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { username, email, password, first_name, last_name, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Create user
      const userId = await User.create({
        username,
        email,
        password,
        first_name,
        last_name,
        phone
      });

      // Generate and send OTP
      const otpCode = await OTP.generateOTP(userId, email);
      await sendOTPEmail(email, otpCode, first_name);

      res.status(201).json({
        message: 'User registered successfully. Please check your email for OTP.',
        userId,
        needsVerification: true
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Verify OTP
  verifyOTP: async (req, res) => {
    try {
      const { userId, otpCode } = req.body;

      const isValid = await OTP.verifyOTP(userId, otpCode);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Mark user as verified
      await User.markAsVerified(userId);

      res.json({ 
        message: 'Email verified successfully. You can now login.' 
      });

    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      // Check if verified
      if (!user.is_verified) {
        return res.status(400).json({ 
          error: 'Please verify your email first',
          needsVerification: true,
          userId: user.user_id
        });
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.user_id, 
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user data (without password)
      const userData = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      };

      res.json({
        message: 'Login successful',
        token,
        user: userData
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      res.json({ user: req.user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Resend OTP
  resendOTP: async (req, res) => {
    try {
      const { userId, email } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate new OTP
      const otpCode = await OTP.generateOTP(userId, email);
      await sendOTPEmail(email, otpCode, user.first_name);

      res.json({ message: 'OTP sent successfully' });

    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = authController;