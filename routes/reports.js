const express = require('express');
const router = express.Router();
const db = require('../database');

// 1. Sales Report (Period)
router.get('/sales', (req, res) => {
    const { start, end } = req.query; // YYYY-MM-DD
    try {
        const stmt = db.prepare(`
            SELECT * FROM ventas 
            WHERE date(fecha_venta) BETWEEN date(?) AND date(?)
            ORDER BY fecha_venta DESC
        `);
        const sales = stmt.all(start, end);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Sales Comparison (Period A vs Period B)
router.get('/comparison', (req, res) => {
    const { startA, endA, startB, endB } = req.query;
    try {
        const salesA = db.prepare(`SELECT SUM(total) as total FROM ventas WHERE date(fecha_venta) BETWEEN date(?) AND date(?)`).get(startA, endA);
        const salesB = db.prepare(`SELECT SUM(total) as total FROM ventas WHERE date(fecha_venta) BETWEEN date(?) AND date(?)`).get(startB, endB);

        const totalA = salesA.total || 0;
        const totalB = salesB.total || 0;
        const diff = totalA === 0 ? 0 : ((totalB - totalA) / totalA) * 100;

        res.json({
            periodA: { start: startA, end: endA, total: totalA },
            periodB: { start: startB, end: endB, total: totalB },
            difference_percent: diff.toFixed(2)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Supplier Analysis (Products by Supplier & Best Price)
router.get('/suppliers', (req, res) => {
    try {
        // List products by supplier
        // Products by Supplier with Pricing
        const productsBySupplier = db.prepare(`
            SELECT prov.nombre as proveedor, prod.nombre as producto, prod.codigo, 
                   prod.precio_compra, prod.precio_venta
            FROM productos prod
            JOIN proveedores prov ON prod.id_proveedor = prov.id
            ORDER BY prov.nombre
        `).all();

        res.json({ productsBySupplier });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Restock Prediction ((s, S) System)
router.get('/prediction', (req, res) => {
    try {
        // S = Max Inventory / Target Level
        // s = Reorder Point (stock_minimo)
        // We will estimate S based on 30-day sales volume * 1.5 (buffer)

        const predictions = [];
        const products = db.prepare('SELECT * FROM productos').all();

        for (const p of products) {
            // Get sales last 30 days
            const salesStats = db.prepare(`
                SELECT SUM(dv.cantidad) as total_sold
                FROM detalle_ventas dv
                JOIN ventas v ON dv.id_venta = v.id
                WHERE dv.codigo_producto = ? 
                  AND date(v.fecha_venta) >= date('now', '-30 days')
            `).get(p.codigo);

            const monthlyDemand = salesStats.total_sold || 0;
            const targetLevel_S = Math.max(monthlyDemand * 1.5, p.stock_minimo * 2); // Simple heuristic

            // Get current stock
            const stockStats = db.prepare(`SELECT SUM(cantidad) as total FROM inventario WHERE codigo_producto = ?`).get(p.codigo);
            const currentStock = stockStats.total || 0;

            if (currentStock <= p.stock_minimo) {
                predictions.push({
                    codigo: p.codigo,
                    nombre: p.nombre,
                    current_stock: currentStock,
                    reorder_point_s: p.stock_minimo,
                    target_level_S: Math.ceil(targetLevel_S),
                    monthly_demand: monthlyDemand,
                    suggested_order: Math.ceil(targetLevel_S - currentStock)
                });
            }
        }

        res.json(predictions);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
