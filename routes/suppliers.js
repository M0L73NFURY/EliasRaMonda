const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all suppliers
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM proveedores');
        const suppliers = stmt.all();
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new supplier
router.post('/', (req, res) => {
    try {
        const { nombre, rif, telefono, email, direccion } = req.body;
        const stmt = db.prepare(`
            INSERT INTO proveedores (nombre, rif, telefono, email, direccion)
            VALUES (?, ?, ?, ?, ?)
        `);
        const info = stmt.run(nombre, rif, telefono, email, direccion);
        res.json({ id: info.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update supplier
router.put('/:id', (req, res) => {
    try {
        const { nombre, rif, telefono, email, direccion, activo } = req.body;
        const stmt = db.prepare(`
            UPDATE proveedores
            SET nombre = ?, rif = ?, telefono = ?, email = ?, direccion = ?, activo = ?
            WHERE id = ?
        `);
        const info = stmt.run(nombre, rif, telefono, email, direccion, activo, req.params.id);
        res.json({ changes: info.changes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
