# Sistema de Inventario Retro (v3.0)

Un sistema de gestión de inventario completo con una estética retro de Windows 98, diseñado para pequeñas y medianas empresas.

## 📋 Características

- **Gestión de Productos**: Alta, baja y modificación de productos.
- **Control de Inventario**: Entradas de stock y alertas automáticas de nivel mínimo.
- **Punto de Venta (POS)**: Módulo de ventas integrado que descuenta stock automáticamente.
- **Gestión de Proveedores**: Base de datos de contacto de proveedores.
- **Dashboard en Tiempo Real**: Visualización de alertas y total de ventas del día.
- **Estética Retro**: Interfaz nostálgica pero funcional y responsiva.

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

- `server.js`: El servidor principal.
- `database.js`: Configuración de la base de datos (SQLite).
- `public/`: Archivos del Frontend (HTML, CSS, JS).
- `routes/`: Endpoints de la API para cada módulo.

## 🆘 Soporte

Si encuentras algún error o necesitas ayuda, consulta la sección "Ayuda" dentro de la aplicación o contacta al desarrollador.
