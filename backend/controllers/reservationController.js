const Reservation = require('../models/Reservation');
const Property = require('../models/Property');

const reservationController = {
  // Create new reservation
  createReservation: async (req, res) => {
    try {
      const {
        property_id, check_in, check_out, guests_count, special_requests
      } = req.body;

      // Check property availability
      const isAvailable = await Property.checkAvailability(property_id, check_in, check_out);
      if (!isAvailable) {
        return res.status(400).json({ error: 'Property is not available for the selected dates' });
      }

      // Calculate total price
      const total_price = await Reservation.calculateTotalPrice(
        property_id, check_in, check_out, guests_count
      );

      const reservationData = {
        guest_id: req.user.user_id,
        property_id,
        check_in,
        check_out,
        total_price,
        guests_count: parseInt(guests_count) || 1,
        special_requests
      };

      const reservationId = await Reservation.create(reservationData);
      
      res.status(201).json({
        message: 'Reservation created successfully',
        reservationId,
        total_price
      });
    } catch (error) {
      console.error('Create reservation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get user reservations
  getUserReservations: async (req, res) => {
    try {
      const reservations = await Reservation.findByUserId(req.user.user_id, req.user.role);
      res.json(reservations);
    } catch (error) {
      console.error('Get reservations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get reservation by ID
  getReservationById: async (req, res) => {
    try {
      const reservation = await Reservation.findById(req.params.id);
      
      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Check if user has access to this reservation
      if (reservation.guest_id !== req.user.user_id && 
          reservation.host_id !== req.user.user_id && 
          req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(reservation);
    } catch (error) {
      console.error('Get reservation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update reservation status
  updateReservationStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Check if reservation exists and user has access
      const reservation = await Reservation.findById(id);
      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Only host or admin can update status
      if (reservation.host_id !== req.user.user_id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updated = await Reservation.updateStatus(id, status);
      
      if (updated) {
        res.json({ message: 'Reservation status updated successfully' });
      } else {
        res.status(400).json({ error: 'Failed to update reservation' });
      }
    } catch (error) {
      console.error('Update reservation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Calculate reservation price
  calculatePrice: async (req, res) => {
    try {
      const { property_id, check_in, check_out, guests_count } = req.body;

      if (!property_id || !check_in || !check_out) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const total_price = await Reservation.calculateTotalPrice(
        property_id, check_in, check_out, guests_count
      );

      res.json({
        property_id,
        check_in,
        check_out,
        guests_count,
        total_price
      });
    } catch (error) {
      console.error('Calculate price error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = reservationController;