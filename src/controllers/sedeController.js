
const pool = require('../database/db');

async function altaSede(req, res) {
  const { nombre, direccion, telefono } = req.body;
  try {
    const [resultado] = await pool.query(
      'INSERT INTO sede (nombre, direccion, telefono) VALUES (?, ?, ?)',
      [nombre, direccion, telefono]
    );
    res.status(201).json({ codigo: 201, estado: 'ok', datos: { id: resultado.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al crear sede', datos: null });
  }
}

async function listarSedes(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, nombre, direccion, telefono FROM sede');
    res.json({ codigo: 200, estado: 'ok', datos: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al listar sedes', datos: null });
  }
}

async function modificarSede(req, res) {
  const { id } = req.params;
  const { nombre, direccion, telefono } = req.body;
  try {
    const [resultado] = await pool.query(
      'UPDATE sede SET nombre = ?, direccion = ?, telefono = ? WHERE id = ?',
      [nombre, direccion, telefono, id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ codigo: 404, estado: 'sede no encontrada', datos: null });
    }
    res.json({ codigo: 200, estado: 'ok', datos: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al modificar sede', datos: null });
  }
}


async function bajaSede(req, res) {
  const { id } = req.params;
  try {
    const [usuariosAsociados] = await pool.query(
      "SELECT id FROM usuario WHERE id_sede = ? AND rol IN ('medico', 'operador')",
      [id]
    );
    if (usuariosAsociados.length > 0) {
      return res.status(409).json({
        codigo: 409,
        estado: 'no se puede eliminar la sede: tiene médicos u operadores asociados',
        datos: null
      });
    }

    const [agendaAsociada] = await pool.query(
      'SELECT id FROM agenda WHERE id_sede = ?',
      [id]
    );
    if (agendaAsociada.length > 0) {
      return res.status(409).json({
        codigo: 409,
        estado: 'no se puede eliminar la sede: tiene agenda asociada',
        datos: null
      });
    }

    const [resultado] = await pool.query('DELETE FROM sede WHERE id = ?', [id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ codigo: 404, estado: 'sede no encontrada', datos: null });
    }
    res.json({ codigo: 200, estado: 'ok', datos: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al eliminar sede', datos: null });
  }
}

module.exports = { altaSede, listarSedes, modificarSede, bajaSede };