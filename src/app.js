require('dotenv').config();
const express = require('express');
const pool = require('./database/db');

const app = express();
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ codigo: 200, estado: 'ok', datos: null });
  } catch (err) {
  console.error(err);
  res.status(500).json({ codigo: 500, estado: 'error de conexión a la base', datos: null });
}
});

const coberturaRoutes = require('./routes/coberturaRoutes');
app.use('/coberturas', coberturaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);