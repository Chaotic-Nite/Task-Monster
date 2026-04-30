const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', [
  body('username').isLength({ min: 3, max: 30 }).isAlphanumeric().withMessage('Username must contain only letters and numbers'),
  body('password').isLength({ min: 8 }),
  body('name').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Create new user
    const user = new User({ username: username.toLowerCase(), password, name });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
router.post('/login', [
  body('username').isLength({ min: 3, max: 30 }),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get lifetime progress stats
router.get('/stats', auth, async (req, res) => {
  try {
    const lifetimeStats = req.user.lifetime_stats || {
      tasks_created: 0,
      tasks_completed: 0,
      monsters_defeated: 0
    };

    const overallCompletionRate = lifetimeStats.tasks_created > 0
      ? Math.round((lifetimeStats.tasks_completed / lifetimeStats.tasks_created) * 100)
      : 0;

    res.json({
      tasks_created: lifetimeStats.tasks_created,
      tasks_completed: lifetimeStats.tasks_completed,
      monsters_defeated: lifetimeStats.monsters_defeated,
      overall_completion_rate: overallCompletionRate
    });
  } catch (error) {
    console.error('Get lifetime stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/me', auth, [
  body('name').optional().trim(),
  body('username').optional().isLength({ min: 3, max: 30 }).isAlphanumeric().withMessage('Username must contain only letters and numbers')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, username } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (username && username.toLowerCase() !== user.username) {
      // Check if new username is already taken
      const existingUser = await User.findOne({ username: username.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      user.username = username.toLowerCase();
    }

    await user.save();
    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;