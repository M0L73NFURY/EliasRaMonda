const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all products
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM productos');
        const products = stmt.all();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single product
router.get('/:id', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM productos WHERE codigo = ?');
        const product = stmt.get(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new product
router.post('/', (req, res) => {
    try {
        const { codigo, categoria, nombre, marca, id_proveedor, stock_minimo, precio_compra, precio_venta } = req.body;
        const stmt = db.prepare(`
            INSERT INTO productos (codigo, categoria, nombre, marca, id_proveedor, stock_minimo, precio_compra, precio_venta)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(codigo, categoria, nombre, marca, id_proveedor, stock_minimo, precio_compra, precio_venta);
        res.json({ id: info.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update product
router.put('/:id', (req, res) => {
    try {
        const { categoria, nombre, marca, id_proveedor, stock_minimo, precio_compra, precio_venta, estado } = req.body;
        const stmt = db.prepare(`
            UPDATE productos 
            SET categoria = ?, nombre = ?, marca = ?, id_proveedor = ?, stock_minimo = ?, precio_compra = ?, precio_venta = ?, estado = ?
            WHERE codigo = ?
        `);
        const info = stmt.run(categoria, nombre, marca, id_proveedor, stock_minimo, precio_compra, precio_venta, estado, req.params.id);
        res.json({ changes: info.changes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE product
router.delete('/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM productos WHERE codigo = ?');
        const info = stmt.run(req.params.id);
        res.json({ changes: info.changes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
