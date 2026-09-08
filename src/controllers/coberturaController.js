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

async function altaCobertura(req, res) {
  const { nombre } = req.body;
  try {
    const [resultado] = await pool.query(
      'INSERT INTO cobertura (nombre) VALUES (?)',
      [nombre]
    );
    res.status(201).json({ codigo: 201, estado: 'ok', datos: { id: resultado.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al crear cobertura', datos: null });
  }
}

async function modificarCobertura(req, res) {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const [resultado] = await pool.query(
      'UPDATE cobertura SET nombre = ? WHERE id = ?',
      [nombre, id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ codigo: 404, estado: 'cobertura no encontrada', datos: null });
    }
    res.json({ codigo: 200, estado: 'ok', datos: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al modificar cobertura', datos: null });
  }
}

async function bajaCobertura(req, res) {
  const { id } = req.params;
  try {
    const [asociada] = await pool.query(
      'SELECT id FROM usuario WHERE id_cobertura = ?',
      [id]
    );
    if (asociada.length > 0) {
      return res.status(409).json({
        codigo: 409,
        estado: 'no se puede eliminar la cobertura: tiene usuarios asociados',
        datos: null
      });
    }

    const [resultado] = await pool.query('DELETE FROM cobertura WHERE id = ?', [id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ codigo: 404, estado: 'cobertura no encontrada', datos: null });
    }
    res.json({ codigo: 200, estado: 'ok', datos: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al eliminar cobertura', datos: null });
  }
}

module.exports = { listarCoberturas, altaCobertura, modificarCobertura, bajaCobertura };