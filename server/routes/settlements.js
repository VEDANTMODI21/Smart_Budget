import express from 'express';
import Settlement from '../models/Settlement.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Get all settlements (user-specific - DATA ISOLATION)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const settlements = await Settlement.find({ userId: req.userId })
      .sort({ date: -1 });
    res.json(settlements);
  } catch (error) {
    console.error('Get settlements error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create settlement
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { person, amount, description, date } = req.body;

    if (!person || amount === undefined) {
      return res.status(400).json({ message: 'Person and amount are required' });
    }

    const settlement = new Settlement({
      userId: req.userId,
      person,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date()
    });

    await settlement.save();
    res.status(201).json(settlement);
  } catch (error) {
    console.error('Create settlement error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update settlement
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const settlement = await Settlement.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!settlement) {
      return res.status(404).json({ message: 'Settlement not found' });
    }

    if (req.body.person) settlement.person = req.body.person;
    if (req.body.amount !== undefined) settlement.amount = parseFloat(req.body.amount);
    if (req.body.description !== undefined) settlement.description = req.body.description;
    if (req.body.settled !== undefined) settlement.settled = req.body.settled;

    await settlement.save();
    res.json(settlement);
  } catch (error) {
    console.error('Update settlement error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete settlement
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const settlement = await Settlement.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!settlement) {
      return res.status(404).json({ message: 'Settlement not found' });
    }

    res.json({ message: 'Settlement deleted successfully' });
  } catch (error) {
    console.error('Delete settlement error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

