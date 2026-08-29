const pool = require('../database/db');

/**
 * Alta de historial clínico (POST /historial-clinico). Rol médico.
 * - El turno debe existir, pertenecer al médico logueado y estar en estado 'atendido'.
 * - Un turno solo puede tener un historial clínico asociado.
 */
async function altaHistorial(req, res) {
  const { id_turno, diagnostico, tratamiento, observaciones } = req.body;
  const idMedico = req.usuario.id;

  if (!id_turno || !diagnostico) {
    return res.status(400).json({ codigo: 400, estado: 'faltan campos requeridos', datos: null });
  }

  try {
    const [turnos] = await pool.query(
      `SELECT t.*, a.id_medico
       FROM turno t JOIN agenda a ON a.id = t.id_agenda
       WHERE t.id = ?`,
      [id_turno]
    );
    if (turnos.length === 0) {
      return res.status(404).json({ codigo: 404, estado: 'turno no encontrado', datos: null });
    }
    const turno = turnos[0];

    if (turno.id_medico !== idMedico) {
      return res.status(403).json({ codigo: 403, estado: 'solo puede registrar historial de sus propios turnos', datos: null });
    }
    if (turno.estado !== 'atendido') {
      return res.status(409).json({
        codigo: 409,
        estado: 'el turno debe estar atendido para registrar su historial clínico',
        datos: null
      });
    }

    const [existente] = await pool.query('SELECT id FROM historial_clinico WHERE id_turno = ?', [id_turno]);
    if (existente.length > 0) {
      return res.status(409).json({ codigo: 409, estado: 'el turno ya tiene un historial clínico registrado', datos: null });
    }

    const [resultado] = await pool.query(
      `INSERT INTO historial_clinico (id_turno, id_medico, id_paciente, diagnostico, tratamiento, observaciones)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_turno, idMedico, turno.id_paciente, diagnostico, tratamiento ?? null, observaciones ?? null]
    );

    res.status(201).json({ codigo: 201, estado: 'ok', datos: { id: resultado.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al registrar historial clínico', datos: null });
  }
}

/**
 * Consulta de historial clínico de un paciente (GET /historial-clinico/paciente/:id_paciente).
 * - paciente: solo puede consultar su propio historial completo.
 * - médico: solo ve, dentro de ese paciente, los registros de turnos que él mismo atendió.
 */
async function consultarHistorial(req, res) {
  const { id_paciente } = req.params;
  const { rol, id: idUsuario } = req.usuario;

  if (rol === 'paciente' && Number(id_paciente) !== idUsuario) {
    return res.status(403).json({ codigo: 403, estado: 'no puede consultar el historial clínico de otro paciente', datos: null });
  }

  try {
    const [rows] = rol === 'medico'
      ? await pool.query(
          'SELECT * FROM historial_clinico WHERE id_paciente = ? AND id_medico = ? ORDER BY fecha_registro DESC',
          [id_paciente, idUsuario]
        )
      : await pool.query(
          'SELECT * FROM historial_clinico WHERE id_paciente = ? ORDER BY fecha_registro DESC',
          [id_paciente]
        );

    res.json({ codigo: 200, estado: 'ok', datos: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al consultar historial clínico', datos: null });
  }
}

module.exports = { altaHistorial, consultarHistorial };
