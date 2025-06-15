const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');

// Middleware to verify token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Add new transaction
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, amount, category, date } = req.body;

    const transaction = new Transaction({
      userId: req.userId,
      type,
      amount,
      category,
      date
    });

    await transaction.save();
    res.status(201).json({ message: 'Transaction added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add transaction', error: err.message });
  }
});

// Get all transactions for logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: err.message });
  }
});

// Delete a transaction
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete transaction', error: err.message });
  }
});

module.exports = router;
