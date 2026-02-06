# StockMaster 2000 💾

> **Sistema de Gestión de Inventario Profesional con Estética Retro (Y2K Compliant)**

Un sistema de gestión de inventario robusto y completo, diseñado con una nostálgica interfaz estilo Windows 98/2000. StockMaster 2000 combina la simplicidad del pasado con la potencia del presente: análisis de datos, gráficos dinámicos, gestión de lotes FEFO y predicción de stock.

![StockMaster 2000 Logo](https://img.shields.io/badge/StockMaster-2000-blue?style=for-the-badge&logo=windows95)

## 📋 Características Principales

### 📦 Gestión de Inventario & Ventas
- **Punto de Venta Inteligente**: Descuento automático de stock basado en **FEFO** (First-Expired, First-Out), priorizando lotes próximos a vencer.
- **Control por Lotes**: Seguimiento detallado de fechas de vencimiento y lotes individuales.
- **Alertas en Tiempo Real**: Semáforo visual para productos por vencer (🟡/🟠/🔴) y alertas de stock bajo.
- **Paginación Global**: Listas optimizadas con paginación de 10 elementos para Productos, Inventario y Reportes.
- **Ordenamiento**: Capacidad de ordenar productos por Nombre, Categoría y Precio.

### 📊 Reportes Avanzados v10.0
- **Gráficos Integrados**: 
    - 📊 Barras: Tendencia diaria de ventas.
    - 🍰 Pastel: Distribución de productos por proveedor.
- **Análisis de Márgenes**: Cálculo automático de márgenes de ganancia por proveedor.
- **Historial de Compras**: Registro detallado de adquisiciones y evolución de precios.

### 🖥️ Interfaz & Usabilidad (UI/UX)
- **Estética "Enterprise 99"**: Botones con relieve 3D, ventanas grises clásicas y fuentes de sistema.
- **Dashboard Interactivo**: Panel de control con métricas clave y **Filtros de Alertas** (Ver Todo, Solo Stock, Solo Vencimientos).
- **Ventanas Modales**: Formularios flotantes estilo pop-up para una experiencia "multitarea".
- **Responsive**: Ajuste automático de tablas con scroll horizontal/vertical.

---

## 🚀 Instalación y Puesta en Marcha

### Requisitos previos
*   **Node.js** (v14 o superior)
*   **NPM** (incluido con Node)

### Pasos de Instalación

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/stockmaster-2000.git
    cd stockmaster-2000
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Generar Datos de Prueba (Opcional)**:
    Para poblar la base de datos con 50+ proveedores, productos y ventas de prueba:
    ```bash
    node seed_data.js
    ```

4.  **Iniciar el Servidor**:
    ```bash
    node server.js
    ```
    > El sistema iniciará en: `http://localhost:3001`

---

## 📦 Estructura del Sistema

```text
/
├── public/              # Frontend (Single Page Application)
│   ├── app.js           # Lógica del cliente, gráficos y paginación
│   ├── style.css        # Hoja de estilos "Windows 98"
│   └── index.html       # Punto de entrada
├── routes/              # API REST (Backend)
│   ├── inventory.js     # Lógica de stock y alertas
│   ├── sales.js         # Procesamiento de ventas (FEFO)
│   ├── reports.js       # Endpoints para gráficos y análisis
│   └── ...
├── database.js          # Configuración SQLite
├── seed_data.js         # Script de población de datos
└── server.js            # Servidor Express
```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si encuentras un bug o quieres añadir una feature (quizás soporte para Fax?), abre un Issue o Pull Request.

---
*Developed with ❤️ by Antigravity using Node.js & SQLite.*
*© 1999-2026 StockMaster Systems.*
