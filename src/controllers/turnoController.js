const pool = require('../database/db');
const { sumarMinutos, minutosEntre } = require('../utils/horarios');

/**
 * Alta de turno (POST /turno). Rol paciente u operador.
 * - Resuelve el paciente (token si es paciente, DNI en el body si es operador) y su cobertura.
 * - Valida que la agenda exista y que el horario (con duración fija de 30 min) entre en su rango.
 * - Chequea que no se superponga con otro turno confirmado de esa misma agenda.
 * - Chequea que el médico no quede con turnos en más de 2 sedes ese día, y que haya
 *   al menos 30 min entre el último turno de una sede y el primero de la siguiente.
 * - Si todo pasa: inserta el turno como 'confirmado' y genera la notificación al paciente.
 */

const DURACION_MIN = 30;

async function altaTurno(req, res) {
  const { id_agenda, hora, nota, dni_paciente } = req.body;

  if (!id_agenda || !hora || !nota) {
    return res.status(400).json({ codigo: 400, estado: 'faltan campos requeridos', datos: null });
  }

  try {
    // 1) Resolver id_paciente según el rol
    let id_paciente;
    if (req.usuario.rol === 'paciente') {
      id_paciente = req.usuario.id;
    } else {
      if (!dni_paciente) {
        return res.status(400).json({ codigo: 400, estado: 'dni_paciente es obligatorio', datos: null });
      }
      const [pacientes] = await pool.query(
        "SELECT id, id_cobertura FROM usuario WHERE dni = ? AND rol = 'paciente'",
        [dni_paciente]
      );
      if (pacientes.length === 0) {
        return res.status(404).json({ codigo: 404, estado: 'paciente no encontrado', datos: null });
      }
      id_paciente = pacientes[0].id;
    }

    const [usuarios] = await pool.query('SELECT id_cobertura FROM usuario WHERE id = ?', [id_paciente]);
    const id_cobertura = usuarios[0].id_cobertura;

    // 2) La agenda tiene que existir
    const [agendas] = await pool.query('SELECT * FROM agenda WHERE id = ?', [id_agenda]);
    if (agendas.length === 0) {
      return res.status(404).json({ codigo: 404, estado: 'agenda no encontrada', datos: null });
    }
    const agenda = agendas[0];

    // 3) La hora tiene que estar dentro del rango de la agenda (incluyendo la duración del turno)
    const finTurno = sumarMinutos(hora, DURACION_MIN);
    if (hora < agenda.hora_entrada || finTurno > agenda.hora_salida) {
      return res.status(409).json({ codigo: 409, estado: 'horario fuera del rango disponible en la agenda', datos: null });
    }

    // 4) Sin superposición con otro turno confirmado en la misma agenda
    const [turnosAgenda] = await pool.query(
      "SELECT hora FROM turno WHERE id_agenda = ? AND estado = 'confirmado'",
      [id_agenda]
    );
    const seSuperpone = turnosAgenda.some((t) => {
      const finExistente = sumarMinutos(t.hora, DURACION_MIN);
      return hora < finExistente && t.hora < finTurno;
    });
    if (seSuperpone) {
      return res.status(409).json({ codigo: 409, estado: 'el horario se superpone con otro turno confirmado', datos: null });
    }

    // 5) Máximo dos sedes por médico por día, con 30 min mínimo al cambiar de sede
    const [turnosDelDia] = await pool.query(
      `SELECT t.hora, a.id_sede
       FROM turno t
       JOIN agenda a ON a.id = t.id_agenda
       WHERE a.id_medico = ? AND a.fecha = ? AND t.estado = 'confirmado'
       ORDER BY t.hora ASC`,
      [agenda.id_medico, agenda.fecha]
    );

    const turnosConNuevo = [...turnosDelDia, { hora, id_sede: agenda.id_sede }]
      .sort((a, b) => a.hora.localeCompare(b.hora));

    const sedesDelDia = new Set(turnosConNuevo.map((t) => t.id_sede));
    if (sedesDelDia.size > 2) {
      return res.status(409).json({ codigo: 409, estado: 'el médico ya tiene turnos en dos sedes distintas ese día', datos: null });
    }

    for (let i = 1; i < turnosConNuevo.length; i++) {
      const anterior = turnosConNuevo[i - 1];
      const actual = turnosConNuevo[i];
      if (anterior.id_sede !== actual.id_sede) {
        const finAnterior = sumarMinutos(anterior.hora, DURACION_MIN);
        if (minutosEntre(finAnterior, actual.hora) < DURACION_MIN) {
          return res.status(409).json({
            codigo: 409,
            estado: 'debe haber al menos 30 minutos entre turnos de sedes distintas',
            datos: null
          });
        }
      }
    }

    // 6) Alta del turno
    const [resultado] = await pool.query(
      "INSERT INTO turno (nota, id_agenda, fecha, hora, id_paciente, id_cobertura, estado) VALUES (?, ?, ?, ?, ?, ?, 'confirmado')",
      [nota, id_agenda, agenda.fecha, hora, id_paciente, id_cobertura]
    );

    // 7) Notificación al paciente
    await pool.query(
      "INSERT INTO notificacion (id_usuario, tipo, mensaje, leida, fecha) VALUES (?, 'turno_confirmado', ?, 0, NOW())",
      [id_paciente, `Tu turno del ${agenda.fecha} a las ${hora} fue confirmado.`]
    );

    res.status(201).json({ codigo: 201, estado: 'ok', datos: { id: resultado.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al crear turno', datos: null });
  }
}

module.exports = { altaTurno };