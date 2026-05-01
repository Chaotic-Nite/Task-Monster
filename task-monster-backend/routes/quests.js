const express = require('express');
const { body, validationResult } = require('express-validator');
const Quest = require('../models/Quest');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all quests for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const quests = await Quest.find({ created_by: req.user._id })
      .sort({ createdAt: -1 });
    res.json(quests);
  } catch (error) {
    console.error('Get quests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific quest
router.get('/:id', auth, async (req, res) => {
  try {
    const quest = await Quest.findOne({
      _id: req.params.id,
      created_by: req.user._id
    });

    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    res.json(quest);
  } catch (error) {
    console.error('Get quest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new quest
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim(),
  body('monster_name').optional().trim(),
  body('monster_image').optional().trim(),
  body('monster_dnd_index').optional().trim(),
  body('monster_hp').optional().isNumeric(),
  body('color').optional().trim(),
  body('participants').optional().isArray(),
  body('adventuring_party_id').optional().isString(),
  body('students').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const questData = {
      ...req.body,
      created_by: req.user._id
    };

    const quest = new Quest(questData);
    await quest.save();

    res.status(201).json(quest);
  } catch (error) {
    console.error('Create quest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a quest
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim(),
  body('monster_name').optional().trim(),
  body('monster_image').optional().trim(),
  body('monster_dnd_index').optional().trim(),
  body('monster_hp').optional().isNumeric(),
  body('color').optional().trim(),
  body('participants').optional().isArray(),
  body('adventuring_party_id').optional().isString(),
  body('students').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const quest = await Quest.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    res.json(quest);
  } catch (error) {
    console.error('Update quest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a quest
router.delete('/:id', auth, async (req, res) => {
  try {
    const quest = await Quest.findOneAndDelete({
      _id: req.params.id,
      created_by: req.user._id
    });

    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    res.json({ message: 'Quest deleted successfully' });
  } catch (error) {
    console.error('Delete quest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
