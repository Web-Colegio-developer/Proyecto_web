console.log("Iniciando servidor...");

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {pool,cloudinary} from './db.js';
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from 'multer';
import path from "path";
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"; 
import cron from "node-cron";
import { info } from 'console';
import sgMail from '@sendgrid/mail';

console.log("Dependencias importadas.");

const app = express();
const PORT = process.env.PORT || 3001;

console.log("Creando cliente de Google...");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
console.log("Cliente de Google creado.");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  next();
});
// 🔥 Desactivar COOP/COEP que rompen Google OAuth

app.get('/', (req, res) => {
  res.send('¡El servidor backend está funcionando!');
});

// Tarea programada para eliminar usuarios no verificados cada 10 minutos
cron.schedule("*/25 * * * *", async () => {
  try {
    console.log("⏳ Ejecutando limpieza de usuarios no verificados...");

    const [result] = await pool.query(`
      DELETE FROM usuarios
      WHERE verified = 0 
      AND google_id IS NULL
    `);

    console.log(`🗑 Usuarios eliminados: ${result.affectedRows}`);

  } catch (error) {
    console.error("❌ Error limpiando usuarios:", error);
  }
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req) => {
    let folder = "otros";
    if (req.query.tipo === "perfil") folder = "perfiles";
    else if (req.query.tipo === "proyecto") folder = "proyectos";
    return {
      folder: folder,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    };
  },
});

const upload = multer({ storage });

app.post("/upload-image", upload.single("foto"), async (req, res) => {
  try {
    console.log("recibiendo carpeta", req.query.tipo);
    const imageUrl = req.file.path; 
    console.log("Imagen subida a Cloudinary:", imageUrl);

    res.json({
      success: true,
      url: imageUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error al subir imagen" });
  }
});

app.get("/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({
      message: "Conectado a Cloudinary ✔",
      cloudinary_status: result.status
    });
  } catch (error) {
    res.status(500).json({
      message: "NO conectado ❌",
      error: error.message
    });
  }
});


app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS ayuda');
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('La prueba de conexión a la base de datos falló:', error);
    res.status(500).json({ success: false, message: 'La prueba de conexión a la base de datos falló' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { user, pass } = req.body;

  if (!user || !pass) {
    return res.status(400).json({ message: 'Por favor complete todos los campos' });
  }

  try {
    //Buscar usuario por correo
    const [rows] = await pool.query(
      'SELECT u.id, u.nombres, u.apellidos, u.correo_electronico, u.foto, u.rol, u.passwords, u.verified , m.saldo  FROM usuarios u JOIN monedas m ON u.id = m.usuario_id WHERE u.correo_electronico = ?',
      [user]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const userDB = rows[0];

    if (userDB.verified === 0) {
      return res.status(403).json({ message: 'Por favor verifique su correo electrónico antes de iniciar sesión' });
    }

    //Verificar contraseña cifrada
    const isPasswordValid = await bcrypt.compare(pass, userDB.passwords);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    //Crear token JWT
    const token = jwt.sign(
      {
        id: userDB.id,
        email: userDB.correo_electronico,
        role: userDB.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    //Responder con token y datos
    const userData = {
      id: userDB.id,
      name: `${userDB.nombres} ${userDB.apellidos}`,
      email: userDB.correo_electronico,
      avatarUrl: userDB.foto,
      balance: userDB.saldo,
      role: userDB.rol, 
    };

    res.json({
      result: 'Login exitoso',
      user: userData,
      token: token,
    });

  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.post('/auth/google', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: google_id, email, name, picture: foto } = payload;
    const [nombres, ...apellidos] = name.split(' ');

    // Check if user exists
    const [rows] = await pool.query('SELECT u.id, u.nombres, u.apellidos, u.correo_electronico, u.foto, u.rol, m.saldo FROM usuarios u LEFT JOIN monedas m ON u.id = m.usuario_id WHERE u.correo_electronico = ?', [email]);

    if (rows.length > 0) {
      // User exists, log them in
      const user = rows[0];
      // Optionally, update user's name and photo from Google
      const userData = {
        id: user.id,
        name: `${user.nombres} ${user.apellidos}`,
        email: user.correo_electronico,
        avatarUrl: user.foto,
        balance: user.saldo || 0,
        role: user.rol,
      };
      res.json({ result: 'Login exitoso', user: userData });
    } else {
      // User doesn't exist, create a new one
      const [result] = await pool.query(
        'INSERT INTO usuarios (nombres, apellidos, correo_electronico, foto, rol, google_id) VALUES (?, ?, ?, ?, ?, ?)',
        [nombres, apellidos.join(' '), email, foto, 'estudiante', google_id]
      );
      const newUserId = result.insertId;
      const userData = {
        id: newUserId,
        name: `${nombres} ${apellidos.join(' ')}`,
        email: email,
        avatarUrl: foto,
        balance: 0,
        role: 'estudiante',
      };
      res.json({ result: 'Login exitoso', user: userData });
    }
  } catch (error) {
    console.error('Error en la autenticación con Google:', error);
    res.status(500).json({ message: 'Error en la autenticación con Google' });
  }
});

app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT u.*, m.saldo FROM usuarios u JOIN monedas m ON u.id = m.usuario_id WHERE u.id = ?',
      [id]
    );
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    res.status(500).json({ message: 'Error en la conexión al servidor' });
  }
});

app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { balance, saldo, ...userData } = req.body;
  const balanceToUpdate = balance || saldo;
  delete userData.creado_en;
  try {
    // Evitar que se actualice el correo electrónico si no se proporciona
    if (userData.correo_electronico === '' || userData.correo_electronico === undefined) {
      delete userData.correo_electronico;
    }

    // Si la contraseña está vacía, no la actualices
    if (userData.passwords === '' || userData.passwords === undefined) {
      delete userData.passwords;
    }

    const fields = [];
    const values = [];

    for (const key in userData) {
      if (userData.hasOwnProperty(key)) {
        let value = userData[key];

        if (key === 'fecha_nacimiento') {
          // Format the date to YYYY-MM-DD
          value = new Date(value).toISOString().split('T')[0];
        }

        if (value !== '' && value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
    }

    if (fields.length === 0 && balanceToUpdate === null) {
      return res.status(400).json({ success: false, message: 'No hay datos para actualizar' });
    }

    // Update usuarios table
    if (fields.length > 0) {
      const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`;
      await pool.query(query, [...values, id]);
    }

    // Update monedas table if balance is provided
    if (balanceToUpdate !== null) {
      const email = userData.correo_electronico;
      if (email) {
        const [monedasResult] = await pool.query(
          'UPDATE monedas m JOIN usuarios u ON m.usuario_id = u.id SET m.saldo = ? WHERE u.correo_electronico = ?',
          [balanceToUpdate, email]
        );
        if (monedasResult.affectedRows === 0) {
          // If no row was updated, it might be because the user has no entry in the monedas table.
          // We will try to insert one. We need the user's id for this.
          await pool.query('INSERT INTO monedas (usuario_id, saldo) VALUES (?, ?)', [id, balanceToUpdate]);
        }
      } else {
        // Fallback to original logic if no email is provided in the body
        const [monedasResult] = await pool.query(
          'UPDATE monedas SET saldo = ? WHERE usuario_id = ?',
          [balanceToUpdate, id]
        );
        if (monedasResult.affectedRows === 0) {
          await pool.query('INSERT INTO monedas (usuario_id, saldo) VALUES (?, ?)', [id, balanceToUpdate]);
        }
      }
    }

    res.json({ success: true, message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).json({ message: 'Error en la conexión al servidor' });
  }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ message: 'Error en la conexión al servidor' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT u.id, u.nombres, u.apellidos, u.correo_electronico, u.foto, u.rol, u.telefono, u.direccion, u.fecha_nacimiento, u.lugar, u.genero, m.saldo FROM usuarios u JOIN monedas m ON u.id = m.usuario_id'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ message: 'Error en la conexión al servidor' });
  }
});


// Asegúrate de tener ya importado arriba en tu archivo
// const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


app.post("/register", upload.single("foto"), async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, direccion, fechaNacimiento, ciudad, gender, password, rol } = req.body;

    // Validación básica
    if (!nombre?.trim() || !apellido?.trim() || !email?.trim() || !telefono?.trim() || !direccion?.trim() || !fechaNacimiento?.trim() || !ciudad?.trim() || !gender?.trim() || !password?.trim()) {
      return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
    }
    console.log("Primer paso de validación superado.");
    // Procesar foto
    const foto = req.body.foto
    const rolUsuario = rol?.trim() || "estudiante";

    // Cifrar contraseña
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    console.log("Contraseña cifrada.");
    // Insertar usuario en DB con verified = 0
    await pool.query(
      `INSERT INTO usuarios 
      (nombres, apellidos, correo_electronico, telefono, direccion, fecha_nacimiento, lugar, genero, passwords, foto, rol, verified) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre.trim(),
        apellido.trim(),
        email.trim(),
        telefono.trim(),
        direccion.trim(),
        fechaNacimiento.trim(),
        ciudad.trim(),
        gender.trim(),
        hashedPassword,
        foto,
        rolUsuario,
        0 // verified = 0
      ]
    );
    console.log("Usuario insertado en la base de datos.");
    // Generar token JWT para verificación
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    console.log("Token JWT generado.");
    // Configurar transporter de nodemailer
   const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    console.log("Link de verificación creado:", verificationLink);
    // Enviar correo con SendGrid API
    const msg = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Verifica tu correo electrónico",
      html: `
        <p>Hola ${nombre},</p>
        <p>Gracias por registrarte. Por favor verifica tu correo haciendo clic en el siguiente botón:</p>
        <a href="${verificationLink}" style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        ">Verificar Correo</a>
        <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
        <p>${verificationLink}</p>
      `,
    };
    await sgMail.send(msg);
    console.log("Email enviado vía SendGrid API");

    res.json({ success: true, message: "Usuario registrado exitosamente. Revisa tu correo para verificar la cuenta." });   
    res.json({ success: true, message: "Usuario registrado exitosamente. Revisa tu correo para verificar la cuenta." });

  } catch (error) {
    console.error("Error en backend:", error);
    res.status(500).json({ success: false, message: "Error en la conexión al servidor" });
  }
});

app.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Token no enviado" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // Activar usuario en la base de datos
    const result = await pool.query("UPDATE usuarios SET verified = 1 WHERE correo_electronico = ?", [email]);

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado o ya verificado" });
    }

    res.json({ success: true, message: "Correo verificado correctamente" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ success: false, message: "El token ha expirado" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ success: false, message: "Token inválido" });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});


console.log("Preparando para escuchar en el puerto",PORT);
app.listen(PORT, () => {
  console.log(`Servidor listo en el puerto ${PORT}`);
});

//Endpoints para tiendas y productos

//Endpoint para obtener tiendas por ownerId
app.get('/stores', async (req, res) => {
  const ownerId = req.query.ownerId;
  if (!ownerId) return res.status(400).json({ success: false, message: 'ownerId requerido' });

  try {
    const [rows] = await pool.query(
      'SELECT id_tienda, id_usuario, nombre_tienda, direccion FROM tienda WHERE id_usuario = ?',
      [ownerId]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error GET /stores:', err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: 'Error en la BD al obtener tiendas', error: err.message });
  }
});

// GET /stores/:storeId - Obtener info de la tienda
app.get("/stores/:storeId", async (req, res) => {
  const { storeId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id_tienda, nombre_tienda, direccion FROM tienda WHERE id_tienda = ?",
      [storeId]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Tienda no encontrada" });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error GET /stores/:storeId", err && (err.stack || err.message || err));
    return res.status(500).json({ success: false, message: "Error en la BD al obtener tienda", error: err.message });
  }
});



//Endpoint para obtener productos por storeId
app.get('/stores/:storeId/products', async (req, res) => {
  const { storeId } = req.params;
  try {
    const [rows] = await pool.query('SELECT p.*, c.nombre_categoria AS categoria FROM producto p INNER JOIN categoria c ON p.id_categoria = c.id_categoria WHERE p.id_tienda = ?', [storeId]);

    const normalized = rows.map(r => {
      const imageUrl = r.foto ?? null;

      return {
        id_producto: r.id_producto ?? r.id ?? r.productId ?? null,
        id_tienda: r.id_tienda ?? r.store_id ?? null,
        nombre_producto: r.nombre_producto ?? r.name ?? r.title ?? null,
        descripcion: r.descripcion ?? r.description ?? null,
        tamaño: r.tamaño ?? r.tamano ?? r.size ?? null,
        precio: r.precio ?? r.price ?? 0,
        stock: r.stock ?? r.cantidad ?? 0,
        raw: r,
        imageUrl,
        category: r.categoria ?? null
      };
    });

    return res.json({ success: true, data: normalized });
  } catch (err) {
    console.error(`Error GET /stores/${req.params.storeId}/products:`, err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: 'Error en la BD al obtener productos por tienda', error: err.message });
  }
});

//Endpoint para obtener productos (todos o por storeId)
app.get('/products', async (req, res) => {
  const { storeId } = req.query;
  try {
    let rows;
    if (storeId) {
      [rows] = await pool.query('SELECT p.*, c.nombre_categoria AS categoria FROM producto p INNER JOIN categoria c ON p.id_categoria = c.id_categoria WHERE p.id_tienda = ?', [storeId]);
    } else {
      [rows] = await pool.query('SELECT p.*, c.nombre_categoria AS categoria FROM producto p INNER JOIN categoria c ON p.id_categoria = c.id_categoria LIMIT 500');
    }

    const normalized = rows.map(r => {
      const imageUrl = r.foto ?? null;

      return {
        id_producto: r.id_producto ?? null,
        id_tienda: r.id_tienda ?? null,
        nombre_producto: r.nombre_producto ?? null,
        descripcion: r.descripcion ?? null,
        tamaño: r.tamaño ?? null,
        precio: r.precio ?? 0,
        stock: r.stock ?? 0,
        raw: r,
        imageUrl,
        category: r.categoria ?? null
      };
    });

    return res.json({ success: true, data: normalized });
  } catch (err) {
    console.error('Error GET /products:', err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: 'Error en la BD al obtener productos', error: err.message });
  }
});

//Endpoint para eliminar un producto por id
// DELETE /products/:id
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;

  // validar id
  if (!id) {
    return res.status(400).json({ success: false, message: 'ID requerido' });
  }

  try {
    // Usamos solo id_producto porque esa es la columna real en tu BD
    const [result] = await pool.query('DELETE FROM producto WHERE id_producto = ?', [id]);

    if (result.affectedRows > 0) {
      return res.json({ success: true, message: 'Producto eliminado' });
    } else {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
  } catch (err) {
    console.error(`Error DELETE /products/${id}`, err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: 'Error en la BD', error: err.message });
  }
});

//Actualizar 
// PUT /products/:id
app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_producto, precio, tamaño, stock } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID requerido' });
  }

  try {
    const fields = [];
    const values = [];

    if (nombre_producto !== undefined) {
      fields.push('nombre_producto = ?');
      values.push(nombre_producto);
    }
    if (precio !== undefined) {
      fields.push('precio = ?');
      values.push(precio);
    }
    if (tamaño !== undefined) {
      fields.push('tamaño = ?');
      values.push(tamaño);
    }
    if (stock !== undefined) {
      fields.push('stock = ?');
      values.push(stock);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Nada para actualizar' });
    }

    // Agregamos el id para la cláusula WHERE
    values.push(id);

    const sql = `UPDATE producto SET ${fields.join(', ')} WHERE id_producto = ?`;
    const [result] = await pool.query(sql, values);

    if (result.affectedRows > 0) {
      return res.json({ success: true, message: 'Producto actualizado' });
    } else {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
  } catch (err) {
    console.error(`Error PUT /products/${id}`, err && err.stack ? err.stack : err);
    return res.status(500).json({ success: false, message: 'Error en la BD', error: err.message });
  }
});

// POST - crear producto (sin imágenes) -- tolerante a diferentes nombres de campo
// POST - crear producto (tolerante a JSON o multipart/form-data sin archivos)
app.post("/stores/:storeId/products", upload.none(), async (req, res) => {
  const { storeId } = req.params;

  console.log("POST /stores/:storeId/products llamado. storeId =", storeId);
  console.log("Content-Type header:", req.headers['content-type']);
  // ahora multer.none() habrá llenado req.body con los campos del form-data
  console.log("Body raw (req.body):", req.body);

  const body = req.body || {};

  // Intentamos leer el nombre del producto desde varias claves posibles
  const nombre_producto = body.nombre_producto ?? body.nombre ?? body.name ?? body.producto ?? body.productName;
  const descripcion = body.descripcion ?? body.description ?? body.desc ?? null;
  const tamaño = body.tamaño ?? body.tamano ?? body.size ?? null;
  // Si el campo viene como string (form-data) convertir a número más abajo
  const precioRaw = body.precio ?? body.price ?? null;
  const precio = (precioRaw === null || precioRaw === undefined || precioRaw === "") ? null : Number(precioRaw);
  const stockRaw = body.stock ?? body.cantidad ?? body.qty ?? 0;
  const stock = Number(stockRaw || 0);
  const categoria = body.categoria ?? body.category ?? null;
  const imagenUrl = body.imagenUrl ?? body.imageUrl ?? null;


  // Validaciones
  if (!storeId) {
    return res.status(400).json({ success: false, message: "storeId es requerido en la ruta" });
  }
  if (!nombre_producto || String(nombre_producto).trim() === "") {
    console.warn("Nombre producto ausente. Body keys:", Object.keys(body));
    return res.status(400).json({ success: false, message: "Falta nombre_producto en el body" });
  }
  if (precio === null) {
    return res.status(400).json({ success: false, message: "Falta precio en el body" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO producto (id_tienda, nombre_producto, descripcion, tamaño, precio, stock , foto, id_categoria)
       VALUES (?, ?, ?, ?, ?, ? , ? , ?)`,
      [storeId, nombre_producto, descripcion, tamaño, precio, stock , imagenUrl, categoria]
    );

    console.log("Producto insertado id:", result.insertId);
    return res.json({
      success: true,
      data: {
        id_producto: result.insertId,
        id_tienda: storeId,
        nombre_producto,
        descripcion,
        tamaño,
        precio,
        stock: Number(stock || 0),
        foto: imagenUrl,
        id_categoria: categoria
      }
    });
  } catch (err) {
    console.error("ERROR en POST /stores/:storeId/products:", err && (err.stack || err.message || err));
    return res.status(500).json({ success: false, message: "Error en la BD al crear producto", error: err.message });
  }
});

// APARTADO DEL SALDO USUARIO
app.get('/user/:id/balance', async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await pool.query(
      'SELECT saldo FROM monedas WHERE usuario_id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ balance: rows[0].saldo });
  } catch (error) {
    console.error('Error al obtener el balance del usuario:', error);
    res.status(500).json({ message: 'Error en la conexión al servidor' });
  }
});

app.put('/user/:id/saldo/recargar', async (req, res) => {
  const idUsuario = req.params.id;
  const { monto } = req.body; // monto a recargar

  if (typeof monto !== 'number' || monto <= 0) {
    return res.status(400).json({ mensaje: 'Debe enviar un monto válido mayor a 0' });
  }

  try {
    const [filas] = await pool.query(
      'SELECT saldo FROM monedas WHERE usuario_id = ?',
      [idUsuario]
    );

    if (filas.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const saldoActualizado = parseFloat(filas[0].saldo) + monto;

    await pool.query(
      'UPDATE monedas SET saldo = ? WHERE usuario_id = ?',
      [saldoActualizado, idUsuario]
    );

    res.json({ saldo: saldoActualizado });
  } catch (error) {
    console.error('Error al recargar el saldo del usuario:', error);
    res.status(500).json({ mensaje: 'Error en la conexión al servidor' });
  }
});

app.put('/user/:id/saldo/retirar', async (req, res) => {
  const idUsuario = req.params.id;
  const { monto } = req.body; // monto a retirar

  if (typeof monto !== 'number' || monto <= 0) {
    return res.status(400).json({ mensaje: 'Debe enviar un monto válido mayor a 0' });
  }

  try {
    const [filas] = await pool.query(
      'SELECT saldo FROM monedas WHERE usuario_id = ?',
      [idUsuario]
    );

    if (filas.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const saldoActual = parseFloat(filas[0].saldo);

    if (monto > saldoActual) {
      return res.status(400).json({ mensaje: 'Saldo insuficiente' });
    }

    const saldoActualizado = saldoActual - monto;

    await pool.query(
      'UPDATE monedas SET saldo = ? WHERE usuario_id = ?',
      [saldoActualizado, idUsuario]
    );

    res.json({ saldo: saldoActualizado });
  } catch (error) {
    console.error('Error al retirar saldo del usuario:', error);
    res.status(500).json({ mensaje: 'Error en la conexión al servidor' });
  }
});

app.get('/user/:correo', async (req, res) => {
  const { correo } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT u.*, m.saldo FROM usuarios u JOIN monedas m ON u.id = m.usuario_id WHERE u.correo_electronico = ?',
      [correo]
    );
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    res.status(500).json({ message: 'Error en la conexión al servidor' });
  }
});

app.put('/user/:id/saldo/transferir', async (req, res) => {
  const idUsuarioOrigen = req.params.id; // ID del usuario que hace la transferencia
  const { monto, destinatariocorreo } = req.body;

  if (typeof monto !== 'number' || monto <= 0) {
    return res.status(400).json({ mensaje: 'Debe enviar un monto válido mayor a 0' });
  }

  try {
    // Primero, obtener el usuario origen usando el ID del usuario
    const [filasOrigen] = await pool.query(
      'SELECT saldo FROM monedas WHERE usuario_id = ?',
      [idUsuarioOrigen]
    );
    if (filasOrigen.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario origen no encontrado' });
    }

    const saldoOrigen = parseFloat(filasOrigen[0].saldo);

    // Verificar si el saldo es suficiente
    if (monto > saldoOrigen) {
      return res.status(400).json({ mensaje: 'Saldo insuficiente para realizar la transferencia' });
    }

    // Obtener el ID del destinatario usando su correo electrónico
    const [filasDestino] = await pool.query(
      'SELECT u.id, m.saldo FROM usuarios u JOIN monedas m ON u.id = m.usuario_id WHERE u.correo_electronico = ?',
      [destinatariocorreo]
    );
    if (filasDestino.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario destinatario no encontrado' });
    }

    const idUsuarioDestino = filasDestino[0].id; // ID del destinatario
    const saldoDestino = parseFloat(filasDestino[0].saldo);

    // Actualizar los saldos
    const saldoOrigenActualizado = saldoOrigen - monto;
    const saldoDestinoActualizado = saldoDestino + monto;

    // Actualizar saldo del usuario origen
    await pool.query(
      'UPDATE monedas SET saldo = ? WHERE usuario_id = ?',
      [saldoOrigenActualizado, idUsuarioOrigen]
    );

    // Actualizar saldo del usuario destino
    await pool.query(
      'UPDATE monedas SET saldo = ? WHERE usuario_id = ?',
      [saldoDestinoActualizado, idUsuarioDestino]
    );

    res.json({
      mensaje: 'Transferencia realizada correctamente',
      saldoOrigen: saldoOrigenActualizado,
      saldoDestino: saldoDestinoActualizado,
    });
  } catch (error) {
    console.error('Error en la transferencia de saldo:', error);
    res.status(500).json({ mensaje: 'Error en la conexión al servidor' });
  }
});


// FIN  DEL SALDO USUARIO



//Endpoints transacciones

app.post('/webhooks/wompi', (req, res) => {
  console.log("Evento recibido desde Wompi:", req.body);

  // Siempre responde 200 OK para confirmar que lo recibiste
  res.status(200).send("ok");
})




//Endpoints cambiar contraseñas y recuperar contraseñas

//esta se encargar de enviar el correo con el link para restablecer la contraseña 
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({
      success: false,
      message: "Debes enviar un correo"
    });

    const [rows] = await pool.query(
      "SELECT id, nombres FROM usuarios WHERE correo_electronico = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No existe un usuario con ese correo"
      });
    }

    // Crear token temporal de 15 min
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "15m"
    });

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Enviar correo
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,
      debug: true,
    });

    await transporter.sendMail({
      from: `"Soporte" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Restablecer contraseña",
      html: `
        <p>Hola ${rows[0].nombres},</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${link}" style="
            padding: 10px 20px;
            background:#0d6efd;
            color: white;
            border-radius: 5px;
            text-decoration:none;
        ">Restablecer contraseña</a>

        <p>O copia este enlace:</p>
        <p>${link}</p>
      `,
    },(err, info) => {  
      if (err) console.error("Error al enviar correo:", err);
      else console.log("Correo enviado:", info.response);
    });

    res.json({
      success: true,
      message: "Correo de recuperación enviado"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
});


//Este se encargar al actualizar la contraseña
app.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Datos incompletos" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "UPDATE usuarios SET passwords = ? WHERE correo_electronico = ?",
      [hashed, email]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "No se pudo actualizar la contraseña"
      });
    }

    res.json({
      success: true,
      message: "Contraseña actualizada correctamente"
    });

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ success: false, message: "El token expiró" });
    }

    res.status(500).json({ success: false, message: "Error en servidor" });
  }
});
