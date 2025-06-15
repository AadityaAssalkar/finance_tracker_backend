const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Simple route to test
app.get('/', (req, res) => {
    res.send('Finance Tracker Backend is running 🚀');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)

    .then(() => {
        console.log('✅ MongoDB connected');
        const authRoutes = require('./routes/auth');
        const transactionRoutes = require('./routes/transactions');
        app.use('/api/transactions', transactionRoutes);

        app.use('/api/auth', authRoutes);

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    });
