const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Player = require('../models/Player');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ─── Register ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const existingUser = await Player.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create player
    const player = new Player({
      username,
      email,
      password: hashedPassword,
    });

    await player.save();

    // Create JWT
    const token = jwt.sign({ id: player._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Remove password from response
    const playerObj = player.toObject();
    delete playerObj.password;

    res.status(201).json({
      success: true,
      token,
      player: playerObj,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ─── Login ────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body; // In frontend, username field could be email or username. Let's support both.

    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user by username or email
    const player = await Player.findOne({ $or: [{ username }, { email: username }] });
    if (!player) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, player.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign({ id: player._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Remove password from response
    const playerObj = player.toObject();
    delete playerObj.password;

    res.json({
      success: true,
      token,
      player: playerObj,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ─── Get Me ───────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const player = await Player.findById(req.user.id).select('-password');
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json({ success: true, player });
  } catch (err) {
    console.error('Get Me error:', err);
    res.status(500).json({ message: 'Server error fetching player data' });
  }
});

module.exports = router;
