const pool = require('../database/db');

async function listarCoberturas(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, nombre FROM cobertura');
    res.json({ codigo: 200, estado: 'ok', datos: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al obtener coberturas', datos: null });
  }
}

module.exports = { listarCoberturas };