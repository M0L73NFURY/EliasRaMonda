const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all sales
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM ventas ORDER BY fecha_venta DESC');
        const sales = stmt.all();
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new sale (Handle Transaction + Inventory Update)
router.post('/', (req, res) => {
    // Expected body: { total, tipo_pago, items: [{ codigo_producto, cantidad, precio_venta }] }

    const { total, tipo_pago, items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No items in sale' });
    }

    const insertSale = db.prepare('INSERT INTO ventas (total, tipo_pago, estado) VALUES (?, ?, ?)');
    const insertDetail = db.prepare('INSERT INTO detalle_ventas (id_venta, codigo_producto, cantidad, precio_venta) VALUES (?, ?, ?, ?)');
    const updateInventory = db.prepare(`
        UPDATE inventario 
        SET cantidad = cantidad - ? 
        WHERE id = (
            SELECT id FROM inventario 
            WHERE codigo_producto = ? AND cantidad >= ? 
            ORDER BY fecha_vencimiento ASC LIMIT 1
        )
    `);

    // We need a more complex inventory deduction logic: handling FIFO roughly or just deducting from total.
    // Ideally we enter a transaction.

    const transaction = db.transaction(() => {
        const info = insertSale.run(total, tipo_pago, 'completada');
        const saleId = info.lastInsertRowid;

        for (const item of items) {
            insertDetail.run(saleId, item.codigo_producto, item.cantidad, item.precio_venta);

            // Simple deduction: find batches with stock and deduct
            // This is a simplification. Real FIFO takes more logic.
            // check total stock first
            const checkStock = db.prepare('SELECT SUM(cantidad) as total FROM inventario WHERE codigo_producto = ?').get(item.codigo_producto);
            if (!checkStock.total || checkStock.total < item.cantidad) {
                throw new Error(`Insufficient stock for product ${item.codigo_producto}`);
            }

            let remainingToDeduct = item.cantidad;
            const batches = db.prepare('SELECT id, cantidad FROM inventario WHERE codigo_producto = ? AND cantidad > 0 ORDER BY fecha_vencimiento ASC').all(item.codigo_producto);

            for (const batch of batches) {
                if (remainingToDeduct <= 0) break;

                const deduct = Math.min(batch.cantidad, remainingToDeduct);
                db.prepare('UPDATE inventario SET cantidad = cantidad - ? WHERE id = ?').run(deduct, batch.id);
                remainingToDeduct -= deduct;
            }
        }
        return saleId;
    });

    try {
        const saleId = transaction();
        res.json({ id: saleId, status: 'success' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
