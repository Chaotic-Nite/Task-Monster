const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Quest = require('../models/Quest');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const questId = req.query.quest_id || req.query.group_id;
    const filter = { created_by: req.user._id };

    if (questId) {
      filter.quest_id = questId;
    }

    const tasks = await Task.find(filter)
      .populate('quest_id', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      created_by: req.user._id
    }).populate('quest_id', 'name');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new task
router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim(),
  body('points').optional().isInt({ min: 1, max: 999 }),
  body('quest_id').optional().isMongoId(),
  body('group_id').optional().isMongoId(),
  body('assigned_to').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const questId = req.body.quest_id || req.body.group_id;

    if (!questId) {
      return res.status(400).json({ error: 'quest_id or group_id is required' });
    }

    // Verify that the quest exists and belongs to the user
    const quest = await Quest.findOne({
      _id: questId,
      created_by: req.user._id
    });

    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    const taskData = {
      ...req.body,
      quest_id: questId,
      created_by: req.user._id
    };

    delete taskData.group_id;

    const task = new Task(taskData);
    await task.save();

    await User.updateOne(
      { _id: req.user._id },
      { $inc: { 'lifetime_stats.tasks_created': 1 } }
    );

    // Populate the quest info before returning
    await task.populate('quest_id', 'name');

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a task
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim(),
  body('points').optional().isInt({ min: 1, max: 999 }),
  body('completed').optional().isBoolean(),
  body('assigned_to').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingTask = await Task.findOne({
      _id: req.params.id,
      created_by: req.user._id
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updateData = { ...req.body };

    // If marking as completed, set completed_at timestamp
    if (updateData.completed === true && !updateData.completed_at) {
      updateData.completed_at = new Date();
    } else if (updateData.completed === false) {
      updateData.completed_at = null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('quest_id', 'name');

    const wasCompleted = existingTask.completed === true;
    const willBeCompleted = updateData.completed === true
      ? true
      : updateData.completed === false
        ? false
        : wasCompleted;

    if (!wasCompleted && willBeCompleted) {
      await User.updateOne(
        { _id: req.user._id },
        { $inc: { 'lifetime_stats.tasks_completed': 1 } }
      );

      const questId = existingTask.quest_id;
      const quest = await Quest.findOne({
        _id: questId,
        created_by: req.user._id
      });

      if (quest && !quest.monster_defeat_recorded) {
        const questTasks = await Task.find({
          quest_id: questId,
          created_by: req.user._id
        });

        const totalTaskPoints = questTasks.reduce((sum, t) => sum + t.points, 0);
        const completedPoints = questTasks
          .filter((t) => t.completed)
          .reduce((sum, t) => sum + t.points, 0);
        const maxHP = quest.monster_hp || totalTaskPoints;
        const currentHP = Math.max(maxHP - completedPoints, 0);

        if (maxHP > 0 && currentHP === 0) {
          const markDefeated = await Quest.updateOne(
            { _id: questId, created_by: req.user._id, monster_defeat_recorded: { $ne: true } },
            { $set: { monster_defeat_recorded: true } }
          );

          if (markDefeated.modifiedCount > 0) {
            await User.updateOne(
              { _id: req.user._id },
              { $inc: { 'lifetime_stats.monsters_defeated': 1 } }
            );
          }
        }
      }
    }

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      created_by: req.user._id
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;