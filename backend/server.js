console.log("Iniciando servidor...");

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import multer from 'multer';
import path from "path";
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


console.log("Dependencias importadas.");

const app = express();
const port = 3001;

console.log("Creando cliente de Google...");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
console.log("Cliente de Google creado.");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('¡El servidor backend está funcionando!');
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
    // 1️⃣ Buscar usuario por correo
    const [rows] = await pool.query(
      'SELECT u.id, u.nombres, u.apellidos, u.correo_electronico, u.foto, u.rol, u.passwords, m.saldo FROM usuarios u JOIN monedas m ON u.id = m.usuario_id WHERE u.correo_electronico = ?',
      [user]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const userDB = rows[0];

    // 2️⃣ Verificar contraseña cifrada
    const isPasswordValid = await bcrypt.compare(pass, userDB.passwords);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // 3️⃣ Crear token JWT
    const token = jwt.sign(
      {
        id: userDB.id,
        email: userDB.correo_electronico,
        role: userDB.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // 4️⃣ Responder con token y datos
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
      await pool.query('UPDATE usuarios SET nombres = ?, apellidos = ?, foto = ?, google_id = ? WHERE id = ?', [nombres, apellidos.join(' '), foto, google_id, user.id]);
      const userData = {
        id: user.id,
        name: `${nombres} ${apellidos.join(' ')}`,
        email: user.correo_electronico,
        avatarUrl: foto,
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

      // Create an entry in the monedas table
      await pool.query('INSERT INTO monedas (usuario_id, saldo) VALUES (?, ?)', [newUserId, 0]);

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

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads")); // 👈 más fácil
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/register", upload.single("foto"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    // Desestructuramos usando los nombres reales del frontend
    const { nombre, apellido, email, telefono, direccion, fechaNacimiento, ciudad, gender, password, rol } = req.body;

    // Validación segura
    if (
      !nombre?.trim() ||
      !apellido?.trim() ||
      !email?.trim() ||
      !telefono?.trim() ||
      !direccion?.trim() ||
      !fechaNacimiento?.trim() ||
      !ciudad?.trim() ||
      !gender?.trim() ||
      !password?.trim()
    ) {
      return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
    }

    const foto = req.file ? path.join('backend', 'uploads', req.file.filename) : null;
    const rolUsuario = rol?.trim() || "estudiante";
    const hashedPassword = await bcrypt.hash(password.trim(), 10); // Cifrar la contraseña
    await pool.query(
        `INSERT INTO usuarios 
        (nombres, apellidos, correo_electronico, telefono, direccion, fecha_nacimiento, lugar, genero, passwords, foto, rol) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        rolUsuario
      ]
    );

    res.json({ success: true, message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error en backend:", error);
    res.status(500).json({ success: false, message: "Error en la conexión al servidor" });
  }
});

console.log("Preparando para escuchar en el puerto", port);
app.listen(port, () => {
  console.log(`El servidor se está ejecutando en http://localhost:${port}`);
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
    const [rows] = await pool.query('SELECT * FROM producto WHERE id_tienda = ?', [storeId]);

    const normalized = rows.map(r => {
      const imagenRaw = r.imagen ?? r.foto ?? r.imagen_url ?? r.image ?? r.url_imagen ?? r.img ?? null;
      const filename = (typeof imagenRaw === 'string' && imagenRaw.length) ? path.basename(imagenRaw) : null;
      const imageUrl = filename ? `${req.protocol}://${req.get('host')}/uploads/${filename}` : null;

      return {
        id_producto: r.id_producto ?? r.id ?? r.productId ?? null,
        id_tienda: r.id_tienda ?? r.store_id ?? null,
        nombre_producto: r.nombre_producto ?? r.name ?? r.title ?? null,
        descripcion: r.descripcion ?? r.description ?? null,
        tamaño: r.tamaño ?? r.tamano ?? r.size ?? null,
        precio: r.precio ?? r.price ?? 0,
        stock: r.stock ?? r.cantidad ?? 0,
        raw: r,
        imageUrl
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
      [rows] = await pool.query('SELECT * FROM producto WHERE id_tienda = ?', [storeId]);
    } else {
      [rows] = await pool.query('SELECT * FROM producto LIMIT 500');
    }

    const normalized = rows.map(r => {
      const imagenRaw = r.imagen ?? r.foto ?? r.imagen_url ?? r.image ?? r.url_imagen ?? r.img ?? null;
      const filename = (typeof imagenRaw === 'string' && imagenRaw.length) ? path.basename(imagenRaw) : null;
      const imageUrl = filename ? `${req.protocol}://${req.get('host')}/uploads/${filename}` : null;

      return {
        id_producto: r.id_producto ?? r.id ?? r.productId ?? null,
        id_tienda: r.id_tienda ?? r.store_id ?? null,
        nombre_producto: r.nombre_producto ?? r.name ?? r.title ?? null,
        descripcion: r.descripcion ?? r.description ?? null,
        tamaño: r.tamaño ?? r.tamano ?? r.size ?? null,
        precio: r.precio ?? r.price ?? 0,
        stock: r.stock ?? r.cantidad ?? 0,
        raw: r,
        imageUrl
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
      `INSERT INTO producto (id_tienda, nombre_producto, descripcion, tamaño, precio, stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [storeId, nombre_producto, descripcion, tamaño, precio, stock]
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
        stock: Number(stock || 0)
      }
    });
  } catch (err) {
    console.error("ERROR en POST /stores/:storeId/products:", err && (err.stack || err.message || err));
    return res.status(500).json({ success: false, message: "Error en la BD al crear producto", error: err.message });
  }
});



