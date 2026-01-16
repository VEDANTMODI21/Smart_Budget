import express from 'express';
import mongoose from 'mongoose';
import Reminder from '../models/Reminder.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Get all reminders (user-specific - DATA ISOLATION)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.userId })
      .sort({ date: 1, time: 1 });
    res.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create reminder
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, date, time, description } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ message: 'Title, date, and time are required' });
    }

    const reminder = new Reminder({
      userId: req.userId,
      title,
      date: new Date(date),
      time,
      description
    });

    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update reminder
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid reminder ID' });
    }

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (req.body.title) reminder.title = req.body.title;
    if (req.body.date) reminder.date = new Date(req.body.date);
    if (req.body.time) reminder.time = req.body.time;
    if (req.body.description !== undefined) reminder.description = req.body.description;
    if (req.body.notified !== undefined) reminder.notified = req.body.notified;

    await reminder.save();
    res.json(reminder);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete reminder
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid reminder ID' });
    }

    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

