
# Proyecto Web - React + Vite + Express + MySQL

Este proyecto es una plataforma web que integra un frontend en React (Vite), un backend en Express y una base de datos MySQL. Permite la gestión de usuarios, autenticación, administración y visualización de productos.

## Estructura del proyecto

- **Frontend:**
  - React + Vite
  - Componentes principales: Login, Registro, Perfil de usuario, Tarjeta, Administrador, Grid de productos, Header, Sidebar
  - Rutas protegidas y navegación dinámica según el rol del usuario
  - Estilos personalizados en CSS

- **Backend:**
  - Express.js
  - Conexión a MySQL usando `mysql2/promise`
  - Endpoints para login, registro, consulta de usuarios y productos
  - Gestión de imágenes y archivos con Multer

- **Base de datos:**
  - MySQL
  - Tablas para usuarios, monedas, productos y transacciones

## Principales funcionalidades

- Autenticación de usuarios (login y registro)
- Panel de administración para gestión de usuarios
- Visualización y búsqueda de usuarios
- Visualización de productos en formato grid
- Perfil de usuario editable
- Tarjeta virtual con saldo y acciones (retirar, recargar, transferir, recompra)

## Instalación y ejecución

1. Instalar dependencias en el frontend:
	```bash
	npm install
	```
2. Instalar dependencias en el backend:
	```bash
	cd backend
	npm install
	```
3. Configurar variables de entorno en `backend/.env` para la conexión a MySQL.
4. Ejecutar el backend:
	```bash
	node server.js
	```
5. Ejecutar el frontend:
	```bash
	npm run dev
	```

## Dependencias principales

- React, React Router DOM, React Toastify
- Express, mysql2, multer, dotenv


## Entregables & Releases

Se sigue una estrategia de releases semánticos (SemVer). Cada release representa una fase clave del proyecto.

| Fase | Entregables principales | Tag / Release sugerido |
|---|---:|---|
| Fase 1 — Análisis y Diseño | Documento de requisitos, prototipos de pantallas, especificación de API (Swagger/Postman). | **v0.1.0** — Release title: "Fase 1 — Análisis y Diseño (v0.1.0)" |
| Fase 2 — Backend — Django & MySQL | API funcional (Swagger/Postman), base de datos normalizada, endpoints probados. | **v0.2.0** — "Fase 2 — Backend (v0.2.0)" |
| Fase 3 — Frontend — React | Frontend funcional conectado al backend, flujo completo compra-recarga. | **v0.3.0** — "Fase 3 — Frontend (v0.3.0)" |
| Fase 4 — Integración y Pruebas | Plataforma probada end-to-end; preparada para pruebas piloto. | **v1.0.0** — "Fase 4 — Integración y Pruebas (v1.0.0)" |
| Fase 5 — Despliegue y Mantenimiento | Sistema en producción, documentación técnica y manual de usuario. | **v1.1.0** — "Fase 5 — Despliegue y Mantenimiento (v1.1.0)" |


## Roadmap / Hitos futuros

- **Hito: Analítica y Personalización** — Integración con sistemas de analítica de consumo.
- **Hito: Programas de Fidelización** — Puntos y recompensas.
- **Hito: Pagos Sin Contacto** — NFC / QR para recargas.
- **Hito: Integración con Billeteras Digitales** — Ej: Nequi, Daviplata.

Estos hitos se registran como **Milestones** / Issues etiquetados para seguimiento.
