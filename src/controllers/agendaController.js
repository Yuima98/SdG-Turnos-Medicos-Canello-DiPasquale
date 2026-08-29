const pool = require('../database/db');
const { formatearFecha } = require('../utils/horarios');

async function altaAgenda(req, res) {
  const { hora_entrada, hora_salida, fecha, id_medico, id_especialidad, id_sede } = req.body;

  if (!hora_entrada || !hora_salida || !fecha || !id_medico || !id_especialidad || !id_sede) {
    return res.status(400).json({ codigo: 400, estado: 'faltan campos requeridos', datos: null });
  }

  if (req.usuario.rol === 'medico' && Number(id_medico) !== req.usuario.id) {
    return res.status(403).json({ codigo: 403, estado: 'un médico solo puede gestionar su propia agenda', datos: null });
  }

  try {
    const [medicos] = await pool.query("SELECT id FROM usuario WHERE id = ? AND rol = 'medico'", [id_medico]);
    if (medicos.length === 0) {
      return res.status(400).json({ codigo: 400, estado: 'el médico indicado no existe', datos: null });
    }

    const [especialidades] = await pool.query('SELECT id FROM especialidad WHERE id = ?', [id_especialidad]);
    if (especialidades.length === 0) {
      return res.status(400).json({ codigo: 400, estado: 'la especialidad indicada no existe', datos: null });
    }

    const [sedes] = await pool.query('SELECT id FROM sede WHERE id = ?', [id_sede]);
    if (sedes.length === 0) {
      return res.status(400).json({ codigo: 400, estado: 'la sede indicada no existe', datos: null });
    }

    const [resultado] = await pool.query(
      'INSERT INTO agenda (hora_entrada, hora_salida, fecha, id_medico, id_especialidad, id_sede) VALUES (?, ?, ?, ?, ?, ?)',
      [hora_entrada, hora_salida, fecha, id_medico, id_especialidad, id_sede]
    );
    res.status(201).json({ codigo: 201, estado: 'ok', datos: { id: resultado.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al crear agenda', datos: null });
  }
}

async function listarAgenda(req, res) {
  const { id_medico, id_sede, id_especialidad, fecha } = req.query;
  const condiciones = [];
  const valores = [];

  if (req.usuario.rol === 'medico') {
    condiciones.push('id_medico = ?');
    valores.push(req.usuario.id);
  } else if (id_medico) {
    condiciones.push('id_medico = ?');
    valores.push(id_medico);
  }

  if (id_sede) {
    condiciones.push('id_sede = ?');
    valores.push(id_sede);
  }

  if (id_especialidad) {
    condiciones.push('id_especialidad = ?');
    valores.push(id_especialidad);
  }

  if (fecha) {
    condiciones.push('fecha = ?');
    valores.push(fecha);
  }

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  try {
    const [rows] = await pool.query(
      `SELECT id, hora_entrada, hora_salida, fecha, id_medico, id_especialidad, id_sede FROM agenda ${where} ORDER BY fecha ASC, hora_entrada ASC`,
      valores
    );
    const datos = rows.map((r) => ({ ...r, fecha: formatearFecha(r.fecha) }));
    res.json({ codigo: 200, estado: 'ok', datos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al listar agenda', datos: null });
  }
}

async function modificarAgenda(req, res) {
  const { id } = req.params;
  const { hora_entrada, hora_salida, fecha, id_medico, id_especialidad, id_sede } = req.body;

  try {
    const [existente] = await pool.query('SELECT * FROM agenda WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ codigo: 404, estado: 'registro de agenda no encontrado', datos: null });
    }

    const agenda = existente[0];
    if (req.usuario.rol === 'medico' && agenda.id_medico !== req.usuario.id) {
      return res.status(403).json({ codigo: 403, estado: 'un médico solo puede gestionar su propia agenda', datos: null });
    }
    if (req.usuario.rol === 'medico' && id_medico !== undefined && Number(id_medico) !== req.usuario.id) {
      return res.status(403).json({ codigo: 403, estado: 'un médico solo puede gestionar su propia agenda', datos: null });
    }

    if (id_medico !== undefined) {
      const [medicos] = await pool.query("SELECT id FROM usuario WHERE id = ? AND rol = 'medico'", [id_medico]);
      if (medicos.length === 0) {
        return res.status(400).json({ codigo: 400, estado: 'el médico indicado no existe', datos: null });
      }
    }
    if (id_especialidad !== undefined) {
      const [especialidades] = await pool.query('SELECT id FROM especialidad WHERE id = ?', [id_especialidad]);
      if (especialidades.length === 0) {
        return res.status(400).json({ codigo: 400, estado: 'la especialidad indicada no existe', datos: null });
      }
    }
    if (id_sede !== undefined) {
      const [sedes] = await pool.query('SELECT id FROM sede WHERE id = ?', [id_sede]);
      if (sedes.length === 0) {
        return res.status(400).json({ codigo: 400, estado: 'la sede indicada no existe', datos: null });
      }
    }

    await pool.query(
      `UPDATE agenda SET
        hora_entrada = ?, hora_salida = ?, fecha = ?, id_medico = ?, id_especialidad = ?, id_sede = ?
       WHERE id = ?`,
      [
        hora_entrada ?? agenda.hora_entrada,
        hora_salida ?? agenda.hora_salida,
        fecha ?? agenda.fecha,
        id_medico ?? agenda.id_medico,
        id_especialidad ?? agenda.id_especialidad,
        id_sede ?? agenda.id_sede,
        id
      ]
    );
    res.json({ codigo: 200, estado: 'ok', datos: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al modificar agenda', datos: null });
  }
}

async function bajaAgenda(req, res) {
  const { id } = req.params;
  try {
    const [existente] = await pool.query('SELECT * FROM agenda WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ codigo: 404, estado: 'registro de agenda no encontrado', datos: null });
    }

    const agenda = existente[0];
    if (req.usuario.rol === 'medico' && agenda.id_medico !== req.usuario.id) {
      return res.status(403).json({ codigo: 403, estado: 'un médico solo puede gestionar su propia agenda', datos: null });
    }

    const [turnosAsociados] = await pool.query('SELECT id FROM turno WHERE id_agenda = ?', [id]);
    if (turnosAsociados.length > 0) {
      return res.status(409).json({
        codigo: 409,
        estado: 'no se puede eliminar el registro de agenda: tiene turnos asociados',
        datos: null
      });
    }

    await pool.query('DELETE FROM agenda WHERE id = ?', [id]);
    res.json({ codigo: 200, estado: 'ok', datos: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al eliminar agenda', datos: null });
  }
}

module.exports = { altaAgenda, listarAgenda, modificarAgenda, bajaAgenda };
