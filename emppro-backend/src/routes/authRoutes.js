const express = require('express');
const router = express.Router();
const { login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);

module.exports = router;