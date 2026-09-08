const pool = require('../database/db');

async function altaEspecialidad(req, res) {
  const { descripcion } = req.body;
  try {
    const [resultado] = await pool.query(
      'INSERT INTO especialidad (descripcion) VALUES (?)',
      [descripcion]
    );
    res.status(201).json({ codigo: 201, estado: 'ok', datos: { id: resultado.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al crear especialidad', datos: null });
  }
}

async function listarEspecialidades(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, descripcion FROM especialidad');
    res.json({ codigo: 200, estado: 'ok', datos: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al listar especialidades', datos: null });
  }
}

async function modificarEspecialidad(req, res) {
  const { id } = req.params;
  const { descripcion } = req.body;
  try {
    const [resultado] = await pool.query(
      'UPDATE especialidad SET descripcion = ? WHERE id = ?',
      [descripcion, id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ codigo: 404, estado: 'especialidad no encontrada', datos: null });
    }
    res.json({ codigo: 200, estado: 'ok', datos: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al modificar especialidad', datos: null });
  }
}

async function bajaEspecialidad(req, res) {
  const { id } = req.params;
  try {
    const [asociada] = await pool.query(
      'SELECT id FROM medico_especialidad WHERE id_especialidad = ?',
      [id]
    );
    if (asociada.length > 0) {
      return res.status(409).json({
        codigo: 409,
        estado: 'no se puede eliminar la especialidad: tiene médicos asociados',
        datos: null
      });
    }

    const [resultado] = await pool.query('DELETE FROM especialidad WHERE id = ?', [id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ codigo: 404, estado: 'especialidad no encontrada', datos: null });
    }
    res.json({ codigo: 200, estado: 'ok', datos: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al eliminar especialidad', datos: null });
  }
}

module.exports = { altaEspecialidad, listarEspecialidades, modificarEspecialidad, bajaEspecialidad };