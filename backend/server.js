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
      'SELECT u.nombres, u.apellidos, u.correo_electronico, u.foto, m.saldo FROM usuarios u JOIN monedas m ON u.id = m.usuario_id WHERE u.correo_electronico = ? AND u.passwords = ?',
      [user, pass]
    );

    if (rows.length > 0) {
      const userData = {
        name: `${rows[0].nombres} ${rows[0].apellidos}`,
        email: rows[0].correo_electronico,
        avatarUrl: rows[0].foto,
        balance: rows[0].saldo,
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

app.get('/profile/:email', async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: 'Por favor, proporcione un correo electrónico' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT u.*, m.saldo FROM usuarios u JOIN monedas m ON u.id = m.usuario_id WHERE u.correo_electronico = ?',
      [email]
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

app.put('/profile/:email', async (req, res) => {
  const { email } = req.params;
  const userData = req.body;

  // Evitar que se actualice el correo electrónico
  delete userData.correo_electronico;

  // Si la contraseña está vacía, no la actualices
  if (userData.passwords === '' || userData.passwords === undefined) {
    delete userData.passwords;
  }

  if (!email) {
    return res.status(400).json({ message: 'Por favor, proporcione un correo electrónico' });
  }

  try {
    const fields = [];
    const values = [];

    for (const key in userData) {
      if (userData.hasOwnProperty(key)) {
        // Map frontend keys to database column names if they differ
        let dbColumnName = key;
        switch (key) {
          case 'nombre':
            dbColumnName = 'nombres';
            break;
          case 'apellido':
            dbColumnName = 'apellidos';
            break;
          case 'email':
            dbColumnName = 'correo_electronico';
            break;
          case 'telefono':
            dbColumnName = 'telefono';
            break;
          case 'direccion':
            dbColumnName = 'direccion';
            break;
          case 'fechaNacimiento':
            dbColumnName = 'fecha_nacimiento';
            break;
          case 'ciudad':
            dbColumnName = 'lugar'; // Assuming 'lugar' is for city
            break;
          case 'gender':
            dbColumnName = 'genero';
            break;
          case 'password':
            dbColumnName = 'passwords';
            break;
          case 'avatarUrl':
            dbColumnName = 'foto';
            break;
          case 'rol':
            dbColumnName = 'rol';
            break;
          default:
            // If the key is not explicitly mapped, assume it's a direct column name
            break;
        }

        // Only add to update if the value is not empty or undefined
        if (userData[key] !== '' && userData[key] !== undefined) {
          fields.push(`${dbColumnName} = ?`);
          values.push(userData[key]);
        }
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay datos para actualizar' });
    }

    const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE correo_electronico = ?`;
    values.push(email);

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

