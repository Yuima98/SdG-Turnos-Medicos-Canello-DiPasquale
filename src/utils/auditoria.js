const pool = require('../database/db');

// Un fallo al auditar no debe interrumpir la operación principal, por eso solo se loguea el error.
async function registrarAuditoria({ id_usuario, accion, entidad, id_entidad = null, detalle = null }) {
  try {
    await pool.query(
      'INSERT INTO log_auditoria (id_usuario, accion, entidad, id_entidad, detalle) VALUES (?, ?, ?, ?, ?)',
      [id_usuario, accion, entidad, id_entidad, detalle]
    );
  } catch (err) {
    console.error('Error al registrar auditoría:', err);
  }
}

module.exports = { registrarAuditoria };
