const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const productsRoutes = require('./routes/products');
const suppliersRoutes = require('./routes/suppliers');
const inventoryRoutes = require('./routes/inventory');
const salesRoutes = require('./routes/sales');
const reportsRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/api/products', productsRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/auth', authRoutes);

// Test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: '0.0.1' });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
