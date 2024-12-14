const express = require('express');
const pool = require('../db');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password, preferences } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, password, preferences) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, password, preferences]
        );
        res.status(201).json({ message: 'User registered successfully!', user: result.rows[0] });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials!' });
        }
        res.status(200).json({ message: 'Login successful!', user: result.rows[0] });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
