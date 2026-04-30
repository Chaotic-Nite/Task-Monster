const express = require('express');
const { body, validationResult } = require('express-validator');
const TaskGroup = require('../models/TaskGroup');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all task groups for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const taskGroups = await TaskGroup.find({ created_by: req.user._id })
      .sort({ createdAt: -1 });
    res.json(taskGroups);
  } catch (error) {
    console.error('Get task groups error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific task group
router.get('/:id', auth, async (req, res) => {
  try {
    const taskGroup = await TaskGroup.findOne({
      _id: req.params.id,
      created_by: req.user._id
    });

    if (!taskGroup) {
      return res.status(404).json({ error: 'Task group not found' });
    }

    res.json(taskGroup);
  } catch (error) {
    console.error('Get task group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new task group
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

    const taskGroupData = {
      ...req.body,
      created_by: req.user._id
    };

    const taskGroup = new TaskGroup(taskGroupData);
    await taskGroup.save();

    res.status(201).json(taskGroup);
  } catch (error) {
    console.error('Create task group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a task group
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

    const taskGroup = await TaskGroup.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!taskGroup) {
      return res.status(404).json({ error: 'Task group not found' });
    }

    res.json(taskGroup);
  } catch (error) {
    console.error('Update task group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a task group
router.delete('/:id', auth, async (req, res) => {
  try {
    const taskGroup = await TaskGroup.findOneAndDelete({
      _id: req.params.id,
      created_by: req.user._id
    });

    if (!taskGroup) {
      return res.status(404).json({ error: 'Task group not found' });
    }

    res.json({ message: 'Task group deleted successfully' });
  } catch (error) {
    console.error('Delete task group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;