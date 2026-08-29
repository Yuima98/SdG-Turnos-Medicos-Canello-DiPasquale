const pool = require('../database/db');

/**
 * Listado de notificaciones del usuario autenticado (GET /notificaciones),
 * de más reciente a más antigua.
 */
async function listarNotificaciones(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, tipo, mensaje, leida, fecha FROM notificacion WHERE id_usuario = ? ORDER BY fecha DESC, id DESC',
      [req.usuario.id]
    );
    res.json({ codigo: 200, estado: 'ok', datos: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al listar notificaciones', datos: null });
  }
}

/**
 * Marca una notificación propia como leída (PATCH /notificaciones/:id/leida).
 */
async function marcarLeida(req, res) {
  const { id } = req.params;

  try {
    const [notificaciones] = await pool.query('SELECT * FROM notificacion WHERE id = ?', [id]);
    if (notificaciones.length === 0) {
      return res.status(404).json({ codigo: 404, estado: 'notificación no encontrada', datos: null });
    }
    if (notificaciones[0].id_usuario !== req.usuario.id) {
      return res.status(403).json({ codigo: 403, estado: 'no puede modificar notificaciones de otro usuario', datos: null });
    }

    await pool.query('UPDATE notificacion SET leida = 1 WHERE id = ?', [id]);
    res.json({ codigo: 200, estado: 'ok', datos: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al marcar notificación como leída', datos: null });
  }
}

module.exports = { listarNotificaciones, marcarLeida };
