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
    return res.status(400).json([{ result: 'Por favor complete todos los campos' }]);
  }

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo_electronico = ? AND passwords = ?', [user, pass]);

    if (rows.length > 0) {
      res.json([{ result: 'Login exitoso' }]);
    } else {
      res.status(401).json([{ result: 'Usuario o contraseña incorrectos' }]);
    }
  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    res.status(500).json([{ result: 'Error en la conexión al servidor' }]);
  }
});

app.listen(port, () => {
  console.log(`El servidor se está ejecutando en http://localhost:${port}`);
});
