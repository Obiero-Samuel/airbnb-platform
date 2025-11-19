const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateProperty, handleValidationErrors } = require('../middleware/validation');

// @route   GET /api/properties
// @desc    Get all properties
// @access  Public
router.get('/', propertyController.getAllProperties);

// @route   GET /api/properties/popular
// @desc    Get popular stays
// @access  Public
router.get('/popular', propertyController.getPopularStays);

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Public
router.get('/:id', propertyController.getPropertyById);

// @route   GET /api/properties/:propertyId/availability
// @desc    Check property availability
// @access  Public
router.get('/:propertyId/availability', propertyController.checkAvailability);

// @route   POST /api/properties
// @desc    Create new property
// @access  Private (Host/Admin)
router.post('/', auth, validateProperty, handleValidationErrors, propertyController.createProperty);

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private (Host/Admin)
router.put('/:id', auth, propertyController.updateProperty);

module.exports = router;