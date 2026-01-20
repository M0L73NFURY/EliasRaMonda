const http = require('http');

function post(path, data) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: body }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function get(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3001${path}`, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: body }));
        });
    });
}

async function runTests() {
    try {
        console.log('--- Testing API ---');

        const rand = Math.floor(Math.random() * 1000);
        const uniqueId = 1000 + rand;
        const uniqueSupp = 2000 + rand;

        // 1. Create Supplier
        console.log('Creating Supplier...');
        const suppData = JSON.stringify({ nombre: 'Tech Corp ' + rand, rif: 'J-' + rand, telefono: '555-0001', email: 'contact@tech.com' });
        const suppRes = await post('/api/suppliers', suppData);
        console.log('Supplier Created:', suppRes.status === 200);

        // 2. Create Product
        console.log('Creating Product...');
        const prodData = JSON.stringify({ codigo: uniqueId, nombre: 'Monitor CRT', categoria: 'Electronics', precio_venta: 150.00, stock_minimo: 10 });
        const prodRes = await post('/api/products', prodData);
        console.log('Product Created:', prodRes.status === 200);

        // 3. Add Inventory
        console.log('Adding Inventory...');
        const invData = JSON.stringify({ codigo_producto: uniqueId, cantidad: 5, lote: 'L1', fecha_vencimiento: '2025-01-01' });
        const invRes = await post('/api/inventory', invData);
        console.log('Inventory Added:', invRes.status === 200);

        // 4. Check Alerts (Should trigger because 5 < 10)
        console.log('Checking Alerts...');
        const alertRes = await get('/api/inventory/alerts');
        const alerts = JSON.parse(alertRes.body);
        console.log('Alerts Found:', alerts.length > 0);

        // 5. Test Sale
        console.log('Testing Sale...');
        const saleData = JSON.stringify({
            total: 300,
            tipo_pago: 'efectivo',
            items: [{ codigo_producto: uniqueId, cantidad: 2, precio_venta: 150 }]
        });
        const saleRes = await post('/api/sales', saleData);
        console.log('Sale Processed:', saleRes.status === 200);
        if (saleRes.status !== 200) {
            console.log('Sale Error Body:', saleRes.body);
        }

        // Verify inventory deduction (Should be 5 - 2 = 3)
        const invRes2 = await get('/api/inventory');
        const inv2 = JSON.parse(invRes2.body);
        const prodInv = inv2.find(i => i.codigo === uniqueId);
        console.log('Inventory Deducted correctly:', prodInv.total_stock === 3);

        console.log('--- Tests Completed ---');
    } catch (e) {
        console.error('Test Failed:', e);
    }
}

// Wait for server to start roughly
setTimeout(runTests, 2000);
