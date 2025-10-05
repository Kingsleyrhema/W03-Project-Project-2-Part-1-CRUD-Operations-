const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Register (local)
router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

    const { email, password, name } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const user = new User({ email, password, name, provider: 'local' });
    await user.save();

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server error', error: 'JWT_SECRET not configured on server' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login (local)
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = user.password ? await user.comparePassword(password) : false;
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server error', error: 'JWT_SECRET not configured on server' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '1h' });
    res.status(200).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Logout (client-side should discard token), provide endpoint for compatibility
router.post('/logout', (req, res) => {
  req.logout?.();
  res.json({ message: 'Logged out' });
});

// Google OAuth routes
// Google OAuth removed - using local authentication only

module.exports = router;
