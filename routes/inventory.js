const express = require('express');
const router = express.Router();
const db = require('../database');

// GET current inventory (summary)
router.get('/', (req, res) => {
    try {
        // Retrieves total quantity per product
        const stmt = db.prepare(`
            SELECT p.nombre, p.codigo, SUM(i.cantidad) as total_stock, p.stock_minimo
            FROM productos p
            LEFT JOIN inventario i ON p.codigo = i.codigo_producto
            GROUP BY p.codigo
        `);
        const inventory = stmt.all();
        res.json(inventory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET detailed inventory items
router.get('/details', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT i.*, p.nombre as producto_nombre 
            FROM inventario i
            JOIN productos p ON i.codigo_producto = p.codigo
        `);
        const details = stmt.all();
        res.json(details);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add inventory (Manual adjustment or purchase)
router.post('/', (req, res) => {
    try {
        const { codigo_producto, cantidad, lote, fecha_vencimiento } = req.body;
        const stmt = db.prepare(`
            INSERT INTO inventario (codigo_producto, cantidad, lote, fecha_vencimiento)
            VALUES (?, ?, ?, ?)
        `);
        const info = stmt.run(codigo_producto, cantidad, lote, fecha_vencimiento);
        res.json({ id: info.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Alerts
router.get('/alerts', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT p.nombre, p.codigo, SUM(IFNULL(i.cantidad, 0)) as total_stock, p.stock_minimo
            FROM productos p
            LEFT JOIN inventario i ON p.codigo = i.codigo_producto
            GROUP BY p.codigo
            HAVING total_stock <= p.stock_minimo
        `);
        const alerts = stmt.all();
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
