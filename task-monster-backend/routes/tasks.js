const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const TaskGroup = require('../models/TaskGroup');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { group_id } = req.query;
    const filter = { created_by: req.user._id };

    if (group_id) {
      filter.group_id = group_id;
    }

    const tasks = await Task.find(filter)
      .populate('group_id', 'name')
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
    }).populate('group_id', 'name');

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
  body('group_id').isMongoId(),
  body('assigned_to').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { group_id } = req.body;

    // Verify that the task group exists and belongs to the user
    const taskGroup = await TaskGroup.findOne({
      _id: group_id,
      created_by: req.user._id
    });

    if (!taskGroup) {
      return res.status(404).json({ error: 'Task group not found' });
    }

    const taskData = {
      ...req.body,
      created_by: req.user._id
    };

    const task = new Task(taskData);
    await task.save();

    await User.updateOne(
      { _id: req.user._id },
      { $inc: { 'lifetime_stats.tasks_created': 1 } }
    );

    // Populate the group info before returning
    await task.populate('group_id', 'name');

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
    ).populate('group_id', 'name');

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

      const groupId = existingTask.group_id;
      const taskGroup = await TaskGroup.findOne({
        _id: groupId,
        created_by: req.user._id
      });

      if (taskGroup && !taskGroup.monster_defeat_recorded) {
        const groupTasks = await Task.find({
          group_id: groupId,
          created_by: req.user._id
        });

        const totalTaskPoints = groupTasks.reduce((sum, t) => sum + t.points, 0);
        const completedPoints = groupTasks
          .filter((t) => t.completed)
          .reduce((sum, t) => sum + t.points, 0);
        const maxHP = taskGroup.monster_hp || totalTaskPoints;
        const currentHP = Math.max(maxHP - completedPoints, 0);

        if (maxHP > 0 && currentHP === 0) {
          const markDefeated = await TaskGroup.updateOne(
            { _id: groupId, created_by: req.user._id, monster_defeat_recorded: { $ne: true } },
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