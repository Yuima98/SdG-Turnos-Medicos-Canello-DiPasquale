require('dotenv').config();
const express = require('express');
const pool = require('./database/db');

const authRoutes = require('./routes/authRoutes');
const coberturaRoutes = require('./routes/coberturaRoutes');
const sedeRoutes = require('./routes/sedeRoutes');
const especialidadRoutes = require('./routes/especialidadRoutes');
const agendaRoutes = require('./routes/agendaRoutes');

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

app.use('/auth', authRoutes);
app.use('/coberturas', coberturaRoutes);
app.use('/sedes', sedeRoutes);
app.use('/especialidades', especialidadRoutes);
app.use('/agenda', agendaRoutes);

app.use((req, res) => {
  res.status(404).json({ codigo: 404, estado: 'recurso no encontrado', datos: null });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ codigo: 500, estado: 'error interno del servidor', datos: null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));