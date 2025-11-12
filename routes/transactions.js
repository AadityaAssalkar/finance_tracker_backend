const express = require('express');
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');

const router = express.Router();

/**
 * Middleware to authenticate JWT token
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Expected format: "Bearer <token>"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};

/**
 * @route   POST /api/transactions
 * @desc    Add new transaction
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, amount, category, date } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newTransaction = new Transaction({
      userId: req.userId,
      type,
      amount,
      category,
      date,
    });

    const savedTransaction = await newTransaction.save();

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction: savedTransaction,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add transaction', error: error.message });
  }
});

/**
 * @route   GET /api/transactions
 * @desc    Fetch all transactions of logged-in user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
});

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a transaction by ID
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete transaction', error: error.message });
  }
});

module.exports = router;
