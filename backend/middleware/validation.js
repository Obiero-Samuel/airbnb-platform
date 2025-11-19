const { body, validationResult } = require('express-validator');

// Validation rules
const validateRegistration = [
  body('username')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .isAlphanumeric().withMessage('Username must be alphanumeric'),
  
  body('email')
    .isEmail().withMessage('Must be a valid email'),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('first_name')
    .notEmpty().withMessage('First name is required'),
  
  body('last_name')
    .notEmpty().withMessage('Last name is required')
];

const validateLogin = [
  body('email')
    .isEmail().withMessage('Must be a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

const validateProperty = [
  body('title')
    .notEmpty().withMessage('Title is required'),
  
  body('price_per_night')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('location')
    .notEmpty().withMessage('Location is required')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProperty,
  handleValidationErrors
};