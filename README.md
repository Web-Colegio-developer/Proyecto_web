# Proyecto Web - E-commerce & Gestión de Usuarios

Plataforma web completa que integra un sistema de comercio electrónico, gestión de usuarios, billetera virtual y panel de administración. Construida con **React (Vite)** en el frontend y **Express (Node.js)** en el backend, utilizando **MySQL** como base de datos.

## 🚀 Tecnologías Utilizadas

### Frontend
*   **Framework:** React 18 + Vite
*   **Estilos:** CSS Vanilla (Diseño modular por componentes)
*   **Routing:** React Router DOM v6
*   **Autenticación:** `@react-oauth/google` (Google Login)
*   **Iconos:** Lucide React, Unicons
*   **Notificaciones:** React Toastify
*   **Estado Global:** React Context API (BalanceContext, CartContext)

### Backend
*   **Servidor:** Node.js + Express
*   **Base de Datos:** MySQL (con `mysql2/promise` para consultas asíncronas)
*   **Autenticación:** JWT (JSON Web Tokens), Google Auth Library
*   **Seguridad:** Bcryptjs (Hashing de contraseñas)
*   **Almacenamiento de Imágenes:** Cloudinary + Multer
*   **Correos:** SendGrid (Verificación de email y recuperación de contraseña)
*   **Tareas Programadas:** Node-cron (Limpieza de usuarios no verificados)

## ✨ Funcionalidades Principales

### 👤 Usuarios
*   **Registro y Login:**
    *   Autenticación tradicional (Email/Contraseña) con encriptación.
    *   **Login Social:** Inicio de sesión con Google.
    *   **Verificación de Correo:** Envío de emails con tokens de verificación.
    *   **Recuperación de Contraseña:** Flujo completo de "Olvidé mi contraseña" vía email.
*   **Perfil:** Edición de datos personales y foto de perfil.
*   **Billetera Virtual:**
    *   Consulta de saldo en tiempo real.
    *   Recarga y retiro de saldo (simulado).
    *   Transferencias entre usuarios vía correo electrónico.

### 🛒 E-commerce (Tienda)
*   **Catálogo:** Visualización de productos en formato Grid.
*   **Carrito de Compras:** Agregar productos, ver resumen y "comprar" (descuenta del saldo).
*   **Tiendas:** Visualización de productos por tienda específica.

### 🛡️ Administración (Rol Admin)
*   **Dashboard:** Panel exclusivo para administradores.
*   **Gestión de Usuarios:** Tabla con listado de todos los usuarios registrados.
*   **CRUD:** Capacidad de eliminar o editar usuarios desde el panel.

## 📂 Estructura del Proyecto

```
Proyecto_web/
├── backend/                # Servidor Node.js
│   ├── middlewares/        # Middlewares (Auth, etc.)
│   ├── db.js               # Conexión a BD y Cloudinary
│   ├── server.js           # Lógica principal y Endpoints
│   └── uploads/            # Temporales para subida de archivos
│
├── src/                    # Código fuente Frontend
│   ├── components/         # Componentes React (Login, Dashboard, Cart, etc.)
│   ├── context/            # Contextos globales (Balance, Cart)
│   ├── styles/             # Archivos CSS globales
│   ├── App.jsx             # Configuración de rutas y layout principal
│   └── main.jsx            # Punto de entrada (Providers)
│
└── public/                 # Assets estáticos
```

## ⚙️ Instalación y Configuración

### 1. Base de Datos
Asegúrate de tener MySQL corriendo y crea la base de datos con las tablas necesarias (`usuarios`, `monedas`, `producto`, `tienda`, `categoria`).

### 2. Backend
```bash
cd backend
npm install
```
Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:
```env
PORT=3001
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_base_datos
JWT_SECRET=tu_secreto_jwt
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_CLIENT_ID=...
SENDGRID_API_KEY=...
EMAIL_USER=tu_email_verificado_sendgrid
FRONTEND_URL=http://localhost:5173
```
Ejecuta el servidor:
```bash
npm start
# o
node server.js
```

### 3. Frontend
```bash
# Desde la raíz del proyecto (Proyecto_web)
npm install
npm run dev
```
La aplicación estará disponible en parte de visual `https://gentle-sopapillas-42aa52.netlify.app `.
La parte de API `https://proyecto-web-6xzt.onrender.com/`.


## 🔄 Endpoints Principales (API)

*   `POST /login` - Iniciar sesión
*   `POST /register` - Registrar usuario
*   `GET /products` - Obtener productos
*   `GET /users/:id/balance` - Obtener saldo
*   `PUT /user/:id/saldo/transferir` - Transferir dinero
*   `POST /upload-image` - Subir imagen a Cloudinary

---
Desarrollado como parte del proyecto integrador de desarrollo web.
