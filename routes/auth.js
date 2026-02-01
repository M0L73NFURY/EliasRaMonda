const express = require('express');
const router = express.Router();
const db = require('../database');

// Login Route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    try {
        const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);

        if (user) {
            res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
