// app.js

const API_URL = 'http://localhost:3001/api';

// --- Navigation ---
function showSection(sectionId) {
    const contentArea = document.getElementById('content-area');

    // Clear current content
    contentArea.innerHTML = '';

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
                    <span>Productos Bajo Stock</span>
                    <strong id="stat-low-stock">Loading...</strong>
                </div>
                 <div class="stat-box">
                    <span>Ventas Hoy (Transacciones)</span>
                    <strong id="stat-sales-today">0</strong>
                </div>
            </div>
            
            <div style="margin-top:20px; border: 1px solid gray; padding: 10px;">
               <h4>Alertas Activas</h4>
               <ul id="alerts-list"></ul>
            </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
    updateDashboardStats();
}

async function updateDashboardStats() {
    try {
        // Low Stock
        const resAlerts = await fetch(`${API_URL}/inventory/alerts`);
        const alerts = await resAlerts.json();
        document.getElementById('stat-low-stock').innerText = alerts.length;

        // Sales Today
        const resSales = await fetch(`${API_URL}/sales/today`);
        const salesData = await resSales.json();
        // Now using count
        const salesCount = salesData.count || 0;
        document.getElementById('stat-sales-today').innerText = salesCount;

        // Render Alerts List
        const list = document.getElementById('alerts-list');
        list.innerHTML = '';
        alerts.forEach(a => {
            const li = document.createElement('li');
            li.style.color = 'red';
            li.innerText = `ALERTA: Producto ${a.nombre} (Código: ${a.codigo}) tiene stock ${a.total_stock} (Mín: ${a.stock_minimo})`;
            list.appendChild(li);
        });
    } catch (e) {
        console.error(e);
    }
}


// --- Products ---
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

// Helper for Options
async function generateProductOptions() {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();
    if (products.length === 0) return '<option value="" disabled>No hay productos registrados</option>';

    let options = '<option value="" selected disabled>Seleccione un producto...</option>';
    products.forEach(p => {
        options += `<option value="${p.codigo}">[${p.codigo}] - ${p.nombre} (Stock: ${p.total_stock /* Prop hack */})</option>`;
    });
    return options;
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
        <h3>Inventario</h3>
        <div style="margin-bottom: 15px;">
            <button class="retro-btn" onclick="showAddInventoryForm()">+ Entrada de Stock</button>
        </div>
         <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Total Stock</th>
                    <th>Estado</th>
                </tr>
            </thead>
             <tbody id="inventory-table-body"></tbody>
        </table>
    `;
    document.getElementById('content-area').innerHTML = html;

    const res = await fetch(`${API_URL}/inventory`);
    const inv = await res.json();

    const tbody = document.getElementById('inventory-table-body');
    tbody.innerHTML = '';

    inv.forEach(i => {
        const tr = document.createElement('tr');
        const status = i.total_stock <= i.stock_minimo ? '<span style="color:red; font-weight:bold;">BAJO</span>' : 'OK';
        tr.innerHTML = `
            <td>${i.nombre} (${i.codigo})</td>
            <td>${i.total_stock || 0}</td>
            <td>${status}</td>
         `;
        tbody.appendChild(tr);
    });
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


// --- Other ---
function loadReports() {
    document.getElementById('content-area').innerHTML = '<h3>Reportes</h3><p>Funcionalidad en construcción...</p>';
}

function loadHelp() {
    const html = `
        <h3>Ayuda del Sistema</h3>
        <p>Bienvenido al Sistema de Inventario v1.0. Aquí tiene una guía rápida:</p>
        <ul>
            <li><strong>Dashboard:</strong> Vista general de alertas y estadísticas.</li>
            <li><strong>Productos:</strong> Cree, edite y elimine productos. Defina stock mínimo para alertas.</li>
            <li><strong>Inventario:</strong> Vea el stock actual. Agregue entradas de inventario (compras).</li>
            <li><strong>Ventas:</strong> Procese ventas. Esto descontará automáticamente del inventario (FIFO).</li>
            <li><strong>Proveedores:</strong> Gestione su lista de proveedores.</li>
        </ul>
        <p>Para soporte técnico, contacte al administrador.</p>
    `;
    document.getElementById('content-area').innerHTML = html;
}

// Init
showSection('dashboard');
