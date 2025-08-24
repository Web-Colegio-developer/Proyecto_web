import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db.js';

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
      'SELECT * FROM usuarios WHERE correo_electronico = ?',
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
    const [result] = await pool.query(
      'UPDATE usuarios SET ? WHERE correo_electronico = ?',
      [userData, email]
    );

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
