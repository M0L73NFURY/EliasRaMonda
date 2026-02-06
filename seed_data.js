const Database = require('better-sqlite3');
const db = new Database('inventory.db');

const suppliers = [
    'TechCorp', 'Globex', 'Acme Inc', 'CyberDyne', 'Umbrella Corp',
    'Stark Ind', 'Wayne Ent', 'Massive Dynamic', 'Aperture Sci', 'Black Mesa',
    'InGen', 'Tyrell Corp', 'Weyland-Yutani', 'OCP', 'Oscorp',
    'LexCorp', 'Roxxon', 'Hammer Ind', 'Trask Ind', 'CyberLife',
    'MomCorp', 'Planet Express', 'Vandelay Ind', 'Krusty Burger', 'Los Pollos Hermanos',
    'Dunder Mifflin', 'Sabre', 'Prestige Worldwide', 'Entertainment 720', 'Virtucon',
    'Initech', 'Intertrode', 'Penetrode', 'Initrode', 'Hooli',
    'Pied Piper', 'Aviato', 'Bachmanity', 'Endframe', 'Maleant',
    'Nucleus', 'Raviga', 'Soylent Corp', 'Frobozz', 'Yoyodyne',
    'Binford', 'Biffco', 'Buy n Large', 'Choam', 'Dharma Initiative'
];

const products = [
    'Laptop', 'Mouse', 'Keyboard', 'Monitor 24"', 'Monitor 27"',
    'HDD 1TB', 'HDD 2TB', 'SSD 250GB', 'SSD 500GB', 'SSD 1TB',
    'RAM 8GB', 'RAM 16GB', 'RAM 32GB', 'CPU i5', 'CPU i7',
    'CPU i9', 'GPU 3060', 'GPU 3070', 'GPU 3080', 'GPU 4090',
    'Motherboard ATX', 'Motherboard ITX', 'PSU 650W', 'PSU 750W', 'PSU 850W',
    'Case Tower', 'Case Mini', 'Fan 120mm', 'Fan 140mm', 'Cooler Air',
    'Cooler AIO', 'Thermal Paste', 'Cable HDMI', 'Cable DP', 'Cable Ethernet',
    'Adapter USB-C', 'Webcam 1080p', 'Microphone', 'Headset', 'Speakers',
    'Router Wifi', 'Switch 8-port', 'Access Point', 'Printer Laser', 'Ink Cartridge',
    'Paper Ream', 'Desk Chair', 'Desk Lamp', 'Mousepad giant', 'T-Shirt Geek'
];

// Seed Suppliers
console.log('Seeding Suppliers...');
const stmtSupplier = db.prepare('INSERT INTO proveedores (nombre, rif, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)');
const supplierIds = [];

for (let i = 0; i < 50; i++) {
    const name = suppliers[i] || `Supplier ${i}`;
    const info = stmtSupplier.run(
        name,
        `J-${10000000 + i}`,
        `555-00${i}`,
        `contact@${name.replace(/\s/g, '').toLowerCase()}.com`,
        `Calle ${i}, Ciudad Futura`
    );
    supplierIds.push(info.lastInsertRowid);
}

// Seed Products
console.log('Seeding Products...');
const stmtProduct = db.prepare('INSERT INTO productos (nombre, categoria, marca, id_proveedor, stock_minimo, precio_compra, precio_venta) VALUES (?, ?, ?, ?, ?, ?, ?)');
const productCodes = [];

for (let i = 0; i < 50; i++) {
    const name = products[i] || `Product ${i}`;
    const supplierId = supplierIds[Math.floor(Math.random() * supplierIds.length)];
    const priceBuy = Math.floor(Math.random() * 500) + 10;
    const priceSell = Math.floor(priceBuy * 1.3); // 30% margin

    const info = stmtProduct.run(
        name,
        'Hardware',
        'Generic',
        supplierId,
        10, // Min Stock
        priceBuy,
        priceSell
    );
    productCodes.push(info.lastInsertRowid);
}

// Seed Inventory
console.log('Seeding Inventory...');
const stmtInventory = db.prepare('INSERT INTO inventario (codigo_producto, cantidad, lote, fecha_vencimiento) VALUES (?, ?, ?, ?)');

for (let i = 0; i < 50; i++) {
    const prodId = productCodes[i];
    const qty = Math.floor(Math.random() * 100);
    const year = 2026 + Math.floor(Math.random() * 2);
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    stmtInventory.run(
        prodId,
        qty,
        `BATCH-${2024}-${i}`,
        date
    );
}

// Seed Sales (to test Sales Report)
console.log('Seeding Sales...');
const stmtSale = db.prepare('INSERT INTO ventas (fecha_venta, total, tipo_pago, estado) VALUES (?, ?, ?, ?)');
const stmtSaleDetail = db.prepare('INSERT INTO detalle_ventas (id_venta, codigo_producto, cantidad, precio_venta) VALUES (?, ?, ?, ?)');

for (let i = 0; i < 50; i++) {
    // Random date in last 30 days
    const today = new Date();
    today.setDate(today.getDate() - Math.floor(Math.random() * 30));
    const dateStr = today.toISOString().replace('T', ' ').split('.')[0];

    const total = Math.floor(Math.random() * 500) + 50;

    const info = stmtSale.run(
        dateStr,
        total,
        ['efectivo', 'tarjeta', 'transferencia'][Math.floor(Math.random() * 3)],
        'completada'
    );

    const saleId = info.lastInsertRowid;

    // Add 1-3 items per sale
    const numItems = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numItems; j++) {
        const prodId = productCodes[Math.floor(Math.random() * productCodes.length)];
        stmtSaleDetail.run(saleId, prodId, 1, 100); // Simplified detail
    }
}


console.log('Seeding Complete.');
