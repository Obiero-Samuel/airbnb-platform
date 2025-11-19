const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Basic user routes - we can expand this later
router.get('/profile', auth, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;