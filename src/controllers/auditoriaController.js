const pool = require('../database/db');

async function listarAuditoria(req, res) {
  const { id_usuario, entidad, fecha_desde, fecha_hasta } = req.query;

  const condiciones = [];
  const params = [];

  if (id_usuario) {
    condiciones.push('id_usuario = ?');
    params.push(id_usuario);
  }
  if (entidad) {
    condiciones.push('entidad = ?');
    params.push(entidad);
  }
  if (fecha_desde) {
    condiciones.push('DATE(fecha) >= ?');
    params.push(fecha_desde);
  }
  if (fecha_hasta) {
    condiciones.push('DATE(fecha) <= ?');
    params.push(fecha_hasta);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  try {
    const [rows] = await pool.query(
      `SELECT id, id_usuario, accion, entidad, id_entidad, detalle, fecha
       FROM log_auditoria
       ${where}
       ORDER BY fecha DESC`,
      params
    );
    res.json({ codigo: 200, estado: 'ok', datos: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al obtener el log de auditoría', datos: null });
  }
}

module.exports = { listarAuditoria };
