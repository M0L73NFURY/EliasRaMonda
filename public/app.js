// app.js

const API_URL = 'http://localhost:3001/api';

// --- Navigation ---
function showSection(sectionId) {
    const contentArea = document.getElementById('content-area');

    // Clear current content
    contentArea.innerHTML = '';

    // Update styling for active menu
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    // Find button that calls this section. 
    const map = {
        'dashboard': 'Inicio',
        'products': 'Productos',
        'inventory': 'Inventario',
        'sales': 'Ventas',
        'suppliers': 'Proveedores',
        'reports': 'Reportes',
        'help': 'Ayuda'
    };
    const btnText = map[sectionId];
    if (btnText) {
        const buttons = Array.from(document.querySelectorAll('.menu-item'));
        const btn = buttons.find(b => b.innerText === btnText);
        if (btn) btn.classList.add('active');
    }

    if (sectionId === 'dashboard') {
        loadDashboard();
    } else if (sectionId === 'products') {
        loadProducts();
    } else if (sectionId === 'inventory') {
        loadInventory();
    } else if (sectionId === 'suppliers') {
        loadSuppliers();
    } else if (sectionId === 'sales') {
        loadSales();
    } else if (sectionId === 'reports') {
        loadReports();
    } else if (sectionId === 'help') {
        loadHelp();
    }
}

// --- Dashboard ---
async function loadDashboard() {
    const html = `
        <div id="dashboard-view">
            <h3>Bienvenido al Sistema</h3>
            <p>Seleccione una opción del menú para comenzar.</p>
            <hr>
            <div class="stats-grid">
                <div class="stat-box">
                    <span>Alertas (Stock/Exp)</span>
                    <strong id="stat-low-stock">Loading...</strong>
                </div>
                 <div class="stat-box">
                    <span>Ventas Hoy (Transacciones)</span>
                    <strong id="stat-sales-today">0</strong>
                </div>
            </div>
            
            <div style="margin-top:20px; border: 1px solid gray; padding: 10px;">
               <h4>Panel de Alertas</h4>
               <ul id="alerts-list"></ul>
            </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
    updateDashboardStats();
}

async function updateDashboardStats() {
    try {
        // Alerts
        const resAlerts = await fetch(`${API_URL}/inventory/alerts`);
        const alerts = await resAlerts.json();
        document.getElementById('stat-low-stock').innerText = alerts.length;

        // Sales Today
        const resSales = await fetch(`${API_URL}/sales/today`);
        const salesData = await resSales.json();
        const salesCount = salesData.count || 0;
        document.getElementById('stat-sales-today').innerText = salesCount;

        // Render Alerts List
        const list = document.getElementById('alerts-list');
        list.innerHTML = '';
        if (alerts.length === 0) {
            list.innerHTML = '<li>Sin alertas activas.</li>';
        } else {
            alerts.forEach(a => {
                const li = document.createElement('li');
                if (a.type === 'LOW_STOCK') {
                    li.style.color = 'red';
                    li.innerText = `STOCK: Producto ${a.nombre} (${a.codigo}) tiene stock ${a.total_stock} (Mín: ${a.stock_minimo})`;
                } else if (a.type === 'EXPIRING') {
                    li.style.color = 'orange'; // or DarkOrange
                    li.innerText = `VENCIMIENTO: Producto ${a.nombre} caduca el ${a.fecha_vencimiento.split('T')[0]}`;
                }
                list.appendChild(li);
            });
        }
    } catch (e) {
        console.error(e);
    }
}


// --- Products ---
async function generateProductOptions() {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();
    if (products.length === 0) return '<option value="" disabled>No hay productos registrados</option>';

    let options = '<option value="" selected disabled>Seleccione un producto...</option>';
    products.forEach(p => {
        options += `<option value="${p.codigo}">[${p.codigo}] - ${p.nombre} (Stock: ${p.stock_minimo /* Prop hack */})</option>`;
    });
    return options;
}

async function loadProducts() {
    const html = `
        <h3>Gestión de Productos</h3>
        <div style="margin-bottom: 15px;">
            <button class="retro-btn" onclick="showProductForm()">+ Nuevo Producto</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio Venta</th>
                    <th>Stock Mín</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="products-table-body">
                <tr><td colspan="6">Cargando...</td></tr>
            </tbody>
        </table>
    `;
    document.getElementById('content-area').innerHTML = html;

    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();

    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.codigo}</td>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>$${p.precio_venta}</td>
            <td>${p.stock_minimo}</td>
            <td>
                <button class="retro-btn" onclick='showProductForm(${JSON.stringify(p)})'>Editar</button>
                <button class="retro-btn" onclick="deleteProduct(${p.codigo})">X</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showProductForm(product = null) {
    const isEdit = !!product;
    const html = `
        <h3>${isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h3>
        <form onsubmit="saveProduct(event, ${isEdit})">
            <div class="form-grid">
                <div class="form-group">
                    <label>Código:</label> 
                    <input type="number" name="codigo" value="${product?.codigo || ''}" ${isEdit ? 'readonly' : 'required'}>
                </div>
                <div class="form-group">
                    <label>Nombre:</label> 
                    <input type="text" name="nombre" value="${product?.nombre || ''}" required>
                </div>
                <div class="form-group">
                    <label>Categoría:</label> 
                    <input type="text" name="categoria" value="${product?.categoria || ''}">
                </div>
                <div class="form-group">
                    <label>Marca:</label> 
                    <input type="text" name="marca" value="${product?.marca || ''}">
                </div>
                <div class="form-group">
                    <label>Precio Compra:</label> 
                    <input type="number" step="0.01" name="precio_compra" value="${product?.precio_compra || ''}">
                </div>
                <div class="form-group">
                    <label>Precio Venta:</label> 
                    <input type="number" step="0.01" name="precio_venta" value="${product?.precio_venta || ''}">
                </div>
                <div class="form-group">
                    <label>Stock Mínimo:</label> 
                    <input type="number" name="stock_minimo" value="${product?.stock_minimo || ''}">
                </div>
                <div class="form-group">
                    <label>ID Proveedor:</label> 
                    <input type="number" name="id_proveedor" value="${product?.id_proveedor || ''}">
                </div>
            </div>
            <button type="submit" class="retro-btn">Guardar</button>
            <button type="button" class="retro-btn" onclick="loadProducts()">Cancelar</button>
        </form>
    `;
    document.getElementById('content-area').innerHTML = html;
}

async function saveProduct(e, isEdit) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const url = isEdit ? `${API_URL}/products/${data.codigo}` : `${API_URL}/products`;
    const method = isEdit ? 'PUT' : 'POST';

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadProducts();
}

async function deleteProduct(id) {
    if (confirm('¿Eliminar producto?')) {
        await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        loadProducts();
    }
}


// --- Suppliers ---
async function loadSuppliers() {
    const html = `
        <h3>Proveedores</h3>
        <div style="margin-bottom: 15px;">
            <button class="retro-btn" onclick="showSupplierForm()">+ Nuevo Proveedor</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="suppliers-table-body">
                <tr><td colspan="5">Cargando...</td></tr>
            </tbody>
        </table>
    `;
    document.getElementById('content-area').innerHTML = html;

    const res = await fetch(`${API_URL}/suppliers`);
    const suppliers = await res.json();

    const tbody = document.getElementById('suppliers-table-body');
    tbody.innerHTML = '';

    suppliers.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${s.id}</td>
            <td>${s.nombre}</td>
            <td>${s.telefono}</td>
            <td>${s.email}</td>
            <td>
                 <button class="retro-btn" onclick='showSupplierForm(${JSON.stringify(s)})'>Editar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showSupplierForm(supplier = null) {
    const isEdit = !!supplier;
    const html = `
        <h3>${isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
        <form onsubmit="saveSupplier(event, ${isEdit ? supplier.id : 'null'})">
            <div class="form-grid">
                <div class="form-group">
                    <label>Nombre:</label> 
                    <input type="text" name="nombre" value="${supplier?.nombre || ''}" required>
                </div>
                <div class="form-group">
                    <label>RIF:</label> 
                    <input type="text" name="rif" value="${supplier?.rif || ''}">
                </div>
                <div class="form-group">
                    <label>Teléfono:</label> 
                    <input type="text" name="telefono" value="${supplier?.telefono || ''}">
                </div>
                <div class="form-group">
                    <label>Email:</label> 
                    <input type="email" name="email" value="${supplier?.email || ''}">
                </div>
                <div class="form-group">
                    <label>Dirección:</label> 
                    <input type="text" name="direccion" value="${supplier?.direccion || ''}">
                </div>
            </div>
            <button type="submit" class="retro-btn">Guardar</button>
            <button type="button" class="retro-btn" onclick="loadSuppliers()">Cancelar</button>
        </form>
    `;
    document.getElementById('content-area').innerHTML = html;
}

async function saveSupplier(e, id) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const url = id ? `${API_URL}/suppliers/${id}` : `${API_URL}/suppliers`;
    const method = id ? 'PUT' : 'POST';

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadSuppliers();
}


// --- Inventory ---
async function loadInventory() {
    const html = `
        <h3>Inventario (Detallado)</h3>
        <div style="margin-bottom: 15px;">
            <button class="retro-btn" onclick="showAddInventoryForm()">+ Entrada de Stock</button>
        </div>
         <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Lote</th>
                    <th>Cant</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                </tr>
            </thead>
             <tbody id="inventory-table-body"></tbody>
        </table>
    `;
    document.getElementById('content-area').innerHTML = html;

    try {
        const res = await fetch(`${API_URL}/inventory`);
        const inv = await res.json();

        const tbody = document.getElementById('inventory-table-body');
        tbody.innerHTML = '';

        const now = new Date();

        inv.forEach(i => {
            const tr = document.createElement('tr');

            // Status Logic
            let status = 'OK';
            let color = 'inherit';
            let expiration = i.fecha_vencimiento ? new Date(i.fecha_vencimiento) : null;

            if (!i.cantidad || i.cantidad <= 0) {
                status = 'SIN STOCK';
                color = 'gray';
            }

            if (expiration) {
                const diffTime = expiration - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                    status += ' / VENCIDO';
                    tr.style.backgroundColor = '#ffcccc'; // Light Red row
                } else if (diffDays <= 7) {
                    status += ' / vence pronto';
                    tr.style.backgroundColor = '#ffebcc'; // Orange row
                } else if (diffDays <= 30) {
                    status += ' / verificar fecha';
                    tr.style.backgroundColor = '#ffffcc'; // Yellow warning row
                }
            }

            if (color === 'red') tr.style.color = 'red';
            if (color === 'gray') tr.style.color = 'gray';

            tr.innerHTML = `
                <td>${i.nombre} (${i.codigo})</td>
                <td>${i.lote || '-'}</td>
                <td>${i.cantidad || 0}</td>
                <td>${i.fecha_vencimiento || '-'}</td>
                <td>${status}</td>
             `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
    }
}

async function showAddInventoryForm() {
    const productOptions = await generateProductOptions();

    const html = `
        <h3>Entrada de Inventario</h3>
        <form onsubmit="addInventory(event)">
             <div class="form-grid">
                <div class="form-group">
                    <label>Producto:</label> 
                    <select name="codigo_producto" required class="retro-select">
                        ${productOptions}
                    </select>
                </div>
                 <div class="form-group">
                    <label>Cantidad:</label> 
                    <input type="number" name="cantidad" required>
                </div>
                 <div class="form-group">
                    <label>Lote:</label> 
                    <input type="text" name="lote">
                </div>
                 <div class="form-group">
                    <label>Vencimiento:</label> 
                    <input type="date" name="fecha_vencimiento">
                </div>
            </div>
            <button type="submit" class="retro-btn">Guardar</button>
            <button type="button" class="retro-btn" onclick="loadInventory()">Cancelar</button>
        </form>
    `;
    document.getElementById('content-area').innerHTML = html;
}

async function addInventory(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.cantidad = parseInt(data.cantidad); // ensure int

    await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadInventory();
}

// --- Sales ---
async function loadSales() {
    const productOptions = await generateProductOptions();

    const html = `
        <h3>Ventas</h3>
        <div style="margin-bottom: 15px;">
             <!-- Sales Form -->
             <div style="border: 2px solid var(--button-shadow); padding: 10px; background: #e0e0e0;">
                <h4>Nueva Venta</h4>
                <div class="form-grid">
                     <div class="form-group">
                        <label>Producto:</label>
                        <select id="sale-prod-code" class="retro-select">
                            ${productOptions}
                        </select>
                    </div>
                     <div class="form-group">
                        <label>Cantidad:</label>
                        <input type="number" id="sale-prod-qty" value="1" min="1">
                    </div>
                </div>
                <button class="retro-btn" onclick="addToCart()">Agregar al Carrito</button>
             </div>
             
             <!-- Cart -->
             <div style="margin-top: 20px;">
                <h4>Carrito</h4>
                <table id="cart-table">
                    <thead>
                        <tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th><th>Acción</th></tr>
                    </thead>
                    <tbody></tbody>
                </table>
                <div style="text-align: right; margin-top: 10px;">
                    <strong>Total: $<span id="cart-total">0.00</span></strong>
                </div>
                <div style="margin-top: 10px;">
                    <label>Pago: 
                        <select id="sale-payment-type">
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                        </select>
                    </label>
                    <button class="retro-btn" onclick="processSale()">PROCESAR VENTA</button>
                </div>
             </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
    window.currentCart = [];
}

async function addToCart() {
    const code = document.getElementById('sale-prod-code').value;
    const qty = parseInt(document.getElementById('sale-prod-qty').value);

    if (!code || qty <= 0) return alert('Datos inválidos');

    try {
        const res = await fetch(`${API_URL}/products/${code}`);
        if (res.status !== 200) return alert('Producto no encontrado');
        const prod = await res.json();

        window.currentCart.push({
            codigo_producto: prod.codigo,
            nombre: prod.nombre,
            cantidad: qty,
            precio_venta: prod.precio_venta
        });

        renderCart();
        document.getElementById('sale-prod-code').value = '';
        document.getElementById('sale-prod-qty').value = '1';
    } catch (e) {
        alert('Error al buscar producto');
    }
}

function renderCart() {
    const tbody = document.querySelector('#cart-table tbody');
    tbody.innerHTML = '';
    let total = 0;

    window.currentCart.forEach((item, idx) => {
        const subtotal = item.cantidad * item.precio_venta;
        total += subtotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio_venta}</td>
            <td>$${subtotal.toFixed(2)}</td>
            <td><button class="retro-btn" onclick="removeFromCart(${idx})">Quitar</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('cart-total').innerText = total.toFixed(2);
}

function removeFromCart(idx) {
    window.currentCart.splice(idx, 1);
    renderCart();
}

async function processSale() {
    if (window.currentCart.length === 0) return alert('El carrito está vacío');

    const paymentType = document.getElementById('sale-payment-type').value;
    const total = parseFloat(document.getElementById('cart-total').innerText);

    const saleData = {
        total: total,
        tipo_pago: paymentType,
        items: window.currentCart
    };

    try {
        const res = await fetch(`${API_URL}/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saleData)
        });

        const result = await res.json();

        if (result.error) {
            alert('Error: ' + result.error);
        } else {
            alert('Venta procesada con éxito! ID: ' + result.id);
            loadSales(); // Reset
        }
    } catch (e) {
        alert('Error de conexión');
    }
}


// --- Reports Module (V5) ---
function loadReports() {
    const html = `
        <h3>Reportes Avanzados</h3>
        <div id="reports-nav" class="menu-bar" style="border:none; margin-bottom:15px;">
            <button id="btn-rep-sales" class="menu-item" onclick="showReport('sales')">Ventas</button>
            <button id="btn-rep-comparison" class="menu-item" onclick="showReport('comparison')">Comparativa</button>
            <button id="btn-rep-suppliers" class="menu-item" onclick="showReport('suppliers')">Proveedores</button>
            <button id="btn-rep-prediction" class="menu-item" onclick="showReport('prediction')">Predicción Stock</button>
        </div>
        <div id="report-content" style="border: 2px solid gray; padding: 10px; background: #EEE;">
            <p>Seleccione un tipo de reporte.</p>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

async function showReport(type) {
    // Update active state
    document.querySelectorAll('#reports-nav .menu-item').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-rep-' + type)?.classList.add('active');

    const container = document.getElementById('report-content');
    container.innerHTML = 'Cargando...';

    if (type === 'sales') {
        const today = new Date().toISOString().split('T')[0];
        container.innerHTML = `
            <h4>Reporte de Ventas</h4>
            <div class="form-grid">
                <div><label>Desde:</label> <input type="date" id="rep-start" value="${today}"></div>
                <div><label>Hasta:</label> <input type="date" id="rep-end" value="${today}"></div>
            </div>
            <button class="retro-btn" onclick="runSalesReport()">Generar</button>
            <div id="rep-result"></div>
        `;
    } else if (type === 'comparison') {
        container.innerHTML = `
            <h4>Comparativa de Ventas</h4>
            <div class="form-grid">
                <div><h5>Periodo A (Actual)</h5>
                <label>Desde:</label> <input type="date" id="rep-startA">
                <label>Hasta:</label> <input type="date" id="rep-endA"></div>
                
                <div><h5>Periodo B (Anterior)</h5>
                <label>Desde:</label> <input type="date" id="rep-startB">
                <label>Hasta:</label> <input type="date" id="rep-endB"></div>
            </div>
            <button class="retro-btn" onclick="runComparisonReport()">Comparar</button>
            <div id="rep-result"></div>
        `;
    } else if (type === 'suppliers') {
        const res = await fetch(`${API_URL}/reports/suppliers`);
        const data = await res.json();

        let html = `<h4>Análisis de Proveedores</h4>`;

        // Product-Supplier Map
        html += `<h5>Productos por Proveedor</h5><ul>`;
        data.productsBySupplier.forEach(i => {
            html += `<li><strong>${i.proveedor}</strong>: ${i.producto} (${i.codigo})</li>`;
        });
        html += `</ul>`;

        // Best Prices
        html += `<h5>Mejores Precios Históricos</h5><table><tr><th>Producto</th><th>Proveedor</th><th>Precio Mín</th></tr>`;
        data.bestPrices.forEach(i => {
            html += `<tr><td>${i.producto}</td><td>${i.proveedor}</td><td>$${i.precio_minimo}</td></tr>`;
        });
        html += `</table>`;

        container.innerHTML = html;

    } else if (type === 'prediction') {
        const res = await fetch(`${API_URL}/reports/prediction`);
        const data = await res.json();

        let html = `<h4>Predicción de Compra (Modelo s,S)</h4>`;
        if (data.length === 0) {
            html += `<p>No hay recomendaciones de compra urgentes (Stock > Mínimo).</p>`;
        } else {
            html += `<table><tr><th>Producto</th><th>Stock Actual</th><th>Punto Reorden (s)</th><th>Nivel Objetivo (S)</th><th>Demanda Mes</th><th>ORDEN SUGERIDA</th></tr>`;
            data.forEach(i => {
                html += `<tr>
                    <td>${i.nombre}</td>
                    <td>${i.current_stock}</td>
                    <td>${i.reorder_point_s}</td>
                    <td>${i.target_level_S}</td>
                    <td>${i.monthly_demand}</td>
                    <td style="background:#ffffcc; font-weight:bold;">${i.suggested_order}</td>
                </tr>`;
            });
            html += `</table>`;
        }

        container.innerHTML = html;
    }
}

async function runSalesReport() {
    const start = document.getElementById('rep-start').value;
    const end = document.getElementById('rep-end').value;
    const res = await fetch(`${API_URL}/reports/sales?start=${start}&end=${end}`);
    const data = await res.json();

    let html = `<h5>Resultados (${data.length} ventas)</h5><table><tr><th>ID</th><th>Fecha</th><th>Total</th><th>Pago</th></tr>`;
    let sum = 0;
    data.forEach(v => {
        sum += v.total;
        html += `<tr><td>${v.id}</td><td>${v.fecha_venta}</td><td>$${v.total}</td><td>${v.tipo_pago}</td></tr>`;
    });
    html += `</table><p><strong>Total Período: $${sum.toFixed(2)}</strong></p>`;
    document.getElementById('rep-result').innerHTML = html;
}

async function runComparisonReport() {
    const sA = document.getElementById('rep-startA').value;
    const eA = document.getElementById('rep-endA').value;
    const sB = document.getElementById('rep-startB').value;
    const eB = document.getElementById('rep-endB').value;

    if (!sA || !eA || !sB || !eB) return alert('Seleccione todas las fechas');

    const res = await fetch(`${API_URL}/reports/comparison?startA=${sA}&endA=${eA}&startB=${sB}&endB=${eB}`);
    const data = await res.json();

    let color = data.difference_percent >= 0 ? 'green' : 'red';

    let html = `
        <div style="display:flex; gap:20px; text-align:center; margin-top:20px;">
            <div style="border:1px solid gray; padding:10px; flex:1;">
                <h5>Periodo A</h5>
                <p>${data.periodA.start} al ${data.periodA.end}</p>
                <h3>$${data.periodA.total.toFixed(2)}</h3>
            </div>
            <div style="border:1px solid gray; padding:10px; flex:1;">
                <h5>Periodo B</h5>
                <p>${data.periodB.start} al ${data.periodB.end}</p>
                <h3>$${data.periodB.total.toFixed(2)}</h3>
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;">
             <h4>Diferencia: <span style="color:${color}">${data.difference_percent}%</span></h4>
             <p>${data.difference_percent > 0 ? 'Las ventas AUMENTARON' : 'Las ventas DISMINUYERON'} en el periodo A vs B.</p>
        </div>
    `;
    document.getElementById('rep-result').innerHTML = html;
}

function loadHelp() {
    const html = `
        <h3>Ayuda del Sistema</h3>
        <p>Bienvenido al Sistema de Inventario v5.0.</p>
        <ul>
            <li><strong>Dashboard:</strong> Vista general de alertas (Stock bajo y Vencimientos).</li>
            <li><strong>Productos:</strong> Gestión de catálogo.</li>
            <li><strong>Inventario:</strong> Stock actual. <br>
                <span style="background:#ffffcc">Amarillo</span>: Vence en 30 días.<br>
                <span style="background:#ffebcc">Naranja</span>: Vence en 7 días.<br>
                <span style="background:#ffcccc">Rojo</span>: Vencido.
            </li>
            <li><strong>Ventas:</strong> Punto de venta.</li>
            <li><strong>Reportes:</strong> Analíticas avanzadas y predicción de compras.</li>
        </ul>
    `;
    document.getElementById('content-area').innerHTML = html;
}

// Init
showSection('dashboard');

// Connection Status Check
async function checkConnection() {
    const statusEl = document.getElementById('status-indicator');
    if (!statusEl) return;

    try {
        await fetch(`${API_URL}/health`);
        statusEl.innerText = 'Estado: Conectado';
        statusEl.style.color = '#006600'; // Dark Green
    } catch (e) {
        statusEl.innerText = 'Estado: Desconectado';
        statusEl.style.color = '#800000'; // Dark Red
    }
}
// Run every 5s
setInterval(checkConnection, 5000);
// Run on load
checkConnection();
