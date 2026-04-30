const express = require('express');
const { body, validationResult } = require('express-validator');
const QuestPreset = require('../models/QuestPreset');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const presets = await QuestPreset.find({ created_by: req.user._id }).sort({ createdAt: -1 });
    res.json(presets);
  } catch (error) {
    console.error('Get quest presets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('points').isInt({ min: 1, max: 999 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const preset = new QuestPreset({
      title: req.body.title,
      points: req.body.points,
      created_by: req.user._id,
    });

    await preset.save();
    res.status(201).json(preset);
  } catch (error) {
    console.error('Create quest preset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('points').optional().isInt({ min: 1, max: 999 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const preset = await QuestPreset.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!preset) {
      return res.status(404).json({ error: 'Quest preset not found' });
    }

    res.json(preset);
  } catch (error) {
    console.error('Update quest preset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const preset = await QuestPreset.findOneAndDelete({
      _id: req.params.id,
      created_by: req.user._id,
    });

    if (!preset) {
      return res.status(404).json({ error: 'Quest preset not found' });
    }

    res.json({ message: 'Quest preset deleted successfully' });
  } catch (error) {
    console.error('Delete quest preset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
