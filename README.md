
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


## Entregables    

Etiqueta de Git Propuesta
Fase 1: Análisis y Diseño	Documento de requisitos, prototipos de pantallas, especificación de API.	v0.1.0-fase-diseno
Fase 2: Backend – Django & MySQL	API funcional (Swagger/Postman), base de datos estructurada, endpoints probados.	v0.2.0-fase-backend
Fase 3: Frontend – React	Frontend funcional, conectado al backend, con flujo completo de compra-recarga.	v0.3.0-fase-frontend
Fase 4: Integración y Pruebas	Plataforma probada end-to-end, lista para pruebas piloto con estudiantes reales.	v1.0.0-MVP-final
Fase 5: Despliegue y Mantenimiento	Sistema en producción, documentación técnica y manual de usuario.	v1.1.0-despliegue


## Requisito Futuro    

Hito de Git Propuesto
Integración con sistemas de analítica de consumo.	Hito: Analítica y Personalización
Inclusión de programas de fidelización (puntos, recompensas).	Hito: Programas de Fidelización
Implementación de pagos mediante tecnologías sin contacto (NFC/QR).	Hito: Pagos Sin Contacto
Integración con billeteras digitales externas (ej. Nequi, Daviplata).	Hito: Integración con Billeteras Digitales
