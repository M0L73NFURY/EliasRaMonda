const express = require('express');
const router = express.Router();
const db = require('../database');

// GET current inventory (summary)
// GET current inventory (detailed view)
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT i.id, i.cantidad, i.lote, i.fecha_vencimiento, p.codigo, p.nombre, p.stock_minimo
            FROM productos p
            LEFT JOIN inventario i ON p.codigo = i.codigo_producto
            ORDER BY p.nombre, i.fecha_vencimiento ASC
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

// GET low stock alerts & expirations
router.get('/alerts', (req, res) => {
    try {
        // Low Stock
        const lowStock = db.prepare(`
            SELECT p.nombre, p.codigo, SUM(IFNULL(i.cantidad, 0)) as total_stock, p.stock_minimo, 'LOW_STOCK' as type
            FROM productos p
            LEFT JOIN inventario i ON p.codigo = i.codigo_producto
            GROUP BY p.codigo
            HAVING total_stock <= p.stock_minimo
        `).all();

        // Expirations (e.g., within 30 days)
        const expiring = db.prepare(`
            SELECT p.nombre, i.codigo_producto as codigo, i.cantidad as total_stock, i.fecha_vencimiento, 'EXPIRING' as type
            FROM inventario i
            JOIN productos p ON p.codigo = i.codigo_producto
            WHERE i.fecha_vencimiento IS NOT NULL 
              AND i.cantidad > 0
              AND date(i.fecha_vencimiento) <= date('now', '+30 days')
        `).all();

        res.json([...lowStock, ...expiring]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
