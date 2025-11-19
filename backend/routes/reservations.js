const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { auth } = require('../middleware/auth');

// @route   POST /api/reservations
// @desc    Create new reservation
// @access  Private
router.post('/', auth, reservationController.createReservation);

// @route   GET /api/reservations
// @desc    Get user reservations
// @access  Private
router.get('/', auth, reservationController.getUserReservations);

// @route   GET /api/reservations/:id
// @desc    Get reservation by ID
// @access  Private
router.get('/:id', auth, reservationController.getReservationById);

// @route   PUT /api/reservations/:id/status
// @desc    Update reservation status
// @access  Private (Host/Admin)
router.put('/:id/status', auth, reservationController.updateReservationStatus);

// @route   POST /api/reservations/calculate-price
// @desc    Calculate reservation price
// @access  Private
router.post('/calculate-price', auth, reservationController.calculatePrice);

module.exports = router;