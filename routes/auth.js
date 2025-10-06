const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
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

// Google OAuth routes (active only when configured)
// Helper: return Google OAuth URL as JSON so Swagger can retrieve it without following redirects
router.get('/google/url', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET.trim();
  const callback = process.env.GOOGLE_CALLBACK_URL && process.env.GOOGLE_CALLBACK_URL.trim();
  if (!clientId || !clientSecret || !callback) {
    return res.status(400).json({ message: 'Google OAuth not configured on server' });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callback,
    response_type: 'code',
    scope: 'profile email',
    access_type: 'online'
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url });
});

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(400).json({ message: 'Google OAuth not configured on server' });
  }
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), (req, res) => {
  const user = req.user;
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ message: 'Server error', error: 'JWT_SECRET not configured on server' });
  const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '1h' });
  res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
});

module.exports = router;
