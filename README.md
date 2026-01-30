# Sistema de Inventario Retro (v5.0)

Un sistema de gestión de inventario completo con una estética retro de Windows 98, diseñado para pequeñas y medianas empresas. Esta versión incluye análisis avanzado de datos, gestión de lotes y predicción de stock.

## 📋 Características

- **Gestión de Productos**: Alta, baja y modificación de productos.
- **Control de Inventario Detallado**: 
    - Rastreo por lotes y fechas de vencimiento.
    - Alertas visuales de caducidad (Semáforo: Amarillo/Naranja/Rojo).
    - Entradas de stock granulares.
- **Punto de Venta (POS)**: 
    - Descuento de stock inteligente basado en **FEFO** (First-Expired, First-Out).
    - Prioriza automáticamente la venta de productos próximos a vencer.
- **Módulo de Reportes Avanzados**:
    - **Ventas**: Reportes por rango de fechas.
    - **Comparativas**: Análisis de crecimiento entre dos periodos.
    - **Proveedores**: Historial de mejores precios y productos por proveedor.
    - **Predicción (s,S)**: Algoritmo de reabastecimiento que sugiere cantidades de compra basadas en demanda histórica.
- **Gestión de Proveedores**: Base de datos de contacto de proveedores.
- **Dashboard en Tiempo Real**: Visualización de alertas de stock bajo, vencimientos y métricas diarias.
- **Estética Retro**: Interfaz icónica estilo 90s con respuesta visual activa (botones 3D).

## 🚀 Requisitos de Instalación

Para ejecutar este sistema en cualquier computador, necesitas tener instalado:

1.  **Node.js**: (Versión 14 o superior). Descárgalo en [nodejs.org](https://nodejs.org/).

## 🛠️ Instalación y Uso

Sigue estos pasos para instalar y correr el programa:

1.  **Descargar el código**: Copia la carpeta del proyecto a tu computador.
2.  **Abrir la terminal**: Navega hasta la carpeta del proyecto.
3.  **Instalar dependencias**:
    Ejecuta el siguiente comando para descargar las librerías necesarias:
    ```bash
    npm install
    ```
    *(Esto instalará `express`, `better-sqlite3`, `cors`, y `body-parser`)*.

4.  **Iniciar el Sistema**:
    Ejecuta:
    ```bash
    node server.js
    ```
    Verás un mensaje como: `Server running at http://localhost:3001`

5.  **Abrir en el Navegador**:
    Ve a tu navegador web y entra a:
    `http://localhost:3001`

## 📦 Estructura del Proyecto

- `server.js`: El servidor principal Express.
- `database.js`: Configuración de la base de datos (SQLite) y schemas.
- `public/`: 
    - `app.js`: Lógica del frontend (SPA).
    - `style.css`: Estilos retro.
    - `index.html`: Punto de entrada.
- `routes/`: Endpoints de la API:
    - `inventory.js`: Lógica de stock y alertas.
    - `sales.js`: Procesamiento de ventas y lógica FEFO.
    - `products.js`: CRUD de productos.
    - `suppliers.js`: CRUD de proveedores.
    - `reports.js`: Analíticas y predicciones.

## 🆘 Soporte

Si encuentras algún error o necesitas ayuda, consulta la sección "Ayuda" dentro de la aplicación.
