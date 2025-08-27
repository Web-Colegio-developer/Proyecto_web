import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import multer from 'multer';
import path from "path";



const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

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
    const [rows] = await pool.query(
      'SELECT u.id, u.nombres, u.apellidos, u.correo_electronico, u.foto, u.rol, m.saldo FROM usuarios u JOIN monedas m ON u.id = m.usuario_id WHERE u.correo_electronico = ? AND u.passwords = ?',
      [user, pass]
    );

    if (rows.length > 0) {
      const userData = {
        id: rows[0].id, // Add the user's ID
        name: `${rows[0].nombres} ${rows[0].apellidos}`,
        email: rows[0].correo_electronico,
        avatarUrl: rows[0].foto,
        balance: rows[0].saldo,
        role: rows[0].rol,
      };
      res.json({ result: 'Login exitoso', user: userData });
    } else {
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    res.status(500).json({ message: 'Error en la conexión al servidor' });
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
  const userData = req.body;

  // Evitar que se actualice el correo electrónico si no se proporciona
  if (userData.correo_electronico === '' || userData.correo_electronico === undefined) {
    delete userData.correo_electronico;
  }

  // Evitar que se actualice el saldo
  delete userData.saldo;

  // Si la contraseña está vacía, no la actualices
  if (userData.passwords === '' || userData.passwords === undefined) {
    delete userData.passwords;
  }

  try {
    const fields = [];
    const values = [];

    for (const key in userData) {
      if (userData.hasOwnProperty(key)) {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay datos para actualizar' });
    }

    const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    const [result] = await pool.query(query, values);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Perfil actualizado correctamente' });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
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
    const [rows] = await pool.query('SELECT id, nombres, apellidos, correo_electronico, foto, rol FROM usuarios');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ message: 'Error en la conexión al servidor' });
  }
});

app.listen(port, () => {
  console.log(`El servidor se está ejecutando en http://localhost:${port}`);
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

export default upload;





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
        password.trim(),
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

