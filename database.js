const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('inventory.db', { verbose: console.log });

// Create tables
const schema = `
    CREATE TABLE IF NOT EXISTS proveedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        rif TEXT,
        telefono TEXT,
        email TEXT,
        direccion TEXT,
        activo BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS productos (
        codigo INTEGER PRIMARY KEY,
        categoria TEXT,
        nombre TEXT,
        marca TEXT,
        id_proveedor INTEGER,
        stock_minimo INTEGER,
        precio_compra DECIMAL(10,2),
        precio_venta DECIMAL(10,2),
        estado BOOLEAN DEFAULT 1,
        FOREIGN KEY (id_proveedor) REFERENCES proveedores(id)
    );

    CREATE TABLE IF NOT EXISTS inventario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo_producto INTEGER,
        cantidad INTEGER,
        lote TEXT,
        fecha_vencimiento DATE,
        FOREIGN KEY (codigo_producto) REFERENCES productos(codigo)
    );

    CREATE TABLE IF NOT EXISTS compras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_proveedor INTEGER,
        fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
        numero_factura TEXT,
        total DECIMAL(10,2),
        estado TEXT, -- 'pendiente', 'completada', 'cancelada'
        FOREIGN KEY (id_proveedor) REFERENCES proveedores(id)
    );

    CREATE TABLE IF NOT EXISTS detalle_compras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_compra INTEGER,
        codigo_producto INTEGER,
        cantidad INTEGER,
        precio_compra DECIMAL(10,2),
        lote TEXT,
        fecha_vencimiento DATE,
        FOREIGN KEY (id_compra) REFERENCES compras(id),
        FOREIGN KEY (codigo_producto) REFERENCES productos(codigo)
    );

    CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
        total DECIMAL(10,2),
        tipo_pago TEXT, -- 'efectivo', 'tarjeta', 'transferencia'
        estado TEXT -- 'completada', 'cancelada'
    );

    CREATE TABLE IF NOT EXISTS detalle_ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_venta INTEGER,
        codigo_producto INTEGER,
        cantidad INTEGER,
        precio_venta DECIMAL(10,2),
        FOREIGN KEY (id_venta) REFERENCES ventas(id),
        FOREIGN KEY (codigo_producto) REFERENCES productos(codigo)
    );
`;

db.exec(schema);

module.exports = db;
