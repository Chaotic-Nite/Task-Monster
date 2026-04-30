const express = require('express');
const { body, validationResult } = require('express-validator');
const AdventuringParty = require('../models/AdventuringParty');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all adventuring parties for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const parties = await AdventuringParty.find({ created_by: req.user._id })
      .sort({ createdAt: -1 });
    res.json(parties);
  } catch (error) {
    console.error('Get adventuring parties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific adventuring party
router.get('/:id', auth, async (req, res) => {
  try {
    const party = await AdventuringParty.findOne({
      _id: req.params.id,
      created_by: req.user._id
    });

    if (!party) {
      return res.status(404).json({ error: 'Adventuring party not found' });
    }

    res.json(party);
  } catch (error) {
    console.error('Get adventuring party error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new adventuring party
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim(),
  body('students').optional().isArray(),
  body('color').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const party = new AdventuringParty({
      ...req.body,
      created_by: req.user._id
    });

    await party.save();
    res.status(201).json(party);
  } catch (error) {
    console.error('Create adventuring party error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update an adventuring party
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim(),
  body('students').optional().isArray(),
  body('color').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const party = await AdventuringParty.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!party) {
      return res.status(404).json({ error: 'Adventuring party not found' });
    }

    res.json(party);
  } catch (error) {
    console.error('Update adventuring party error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an adventuring party
router.delete('/:id', auth, async (req, res) => {
  try {
    const party = await AdventuringParty.findOneAndDelete({
      _id: req.params.id,
      created_by: req.user._id
    });

    if (!party) {
      return res.status(404).json({ error: 'Adventuring party not found' });
    }

    res.json({ message: 'Adventuring party deleted successfully' });
  } catch (error) {
    console.error('Delete adventuring party error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;