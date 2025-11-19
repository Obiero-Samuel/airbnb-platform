const Property = require('../models/Property');

const propertyController = {
  // Get all properties
  getAllProperties: async (req, res) => {
    try {
      const filters = {
        property_type: req.query.property_type,
        min_price: req.query.min_price,
        max_price: req.query.max_price,
        location: req.query.location,
        is_available: true // Only show available properties by default
      };

      const properties = await Property.findAll(filters);
      res.json(properties);
    } catch (error) {
      console.error('Get properties error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single property
  getPropertyById: async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
      
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      res.json(property);
    } catch (error) {
      console.error('Get property error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create new property
  createProperty: async (req, res) => {
    try {
      const {
        title, description, property_type, price_per_night,
        location, bedrooms, bathrooms, max_guests, amenities, image_url
      } = req.body;

      const propertyData = {
        host_id: req.user.user_id,
        title,
        description,
        property_type,
        price_per_night: parseFloat(price_per_night),
        location,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        max_guests: parseInt(max_guests),
        amenities: amenities || [],
        image_url
      };

      const propertyId = await Property.create(propertyData);
      
      res.status(201).json({
        message: 'Property created successfully',
        propertyId
      });
    } catch (error) {
      console.error('Create property error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get popular stays
  getPopularStays: async (req, res) => {
    try {
      const popularStays = await Property.getPopularStays();
      res.json(popularStays);
    } catch (error) {
      console.error('Get popular stays error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Check property availability
  checkAvailability: async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { check_in, check_out } = req.query;

      if (!check_in || !check_out) {
        return res.status(400).json({ error: 'Check-in and check-out dates are required' });
      }

      const isAvailable = await Property.checkAvailability(propertyId, check_in, check_out);
      
      res.json({
        available: isAvailable,
        property_id: parseInt(propertyId),
        check_in,
        check_out
      });
    } catch (error) {
      console.error('Check availability error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update property
  updateProperty: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verify property belongs to user
      const property = await Property.findById(id);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      if (property.host_id !== req.user.user_id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updated = await Property.update(id, updateData);
      
      if (updated) {
        res.json({ message: 'Property updated successfully' });
      } else {
        res.status(400).json({ error: 'Failed to update property' });
      }
    } catch (error) {
      console.error('Update property error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = propertyController;