const pool = require('../database/db');

function filtroFechas(fecha_desde, fecha_hasta, columna) {
  const condiciones = [];
  const params = [];
  if (fecha_desde) {
    condiciones.push(`${columna} >= ?`);
    params.push(fecha_desde);
  }
  if (fecha_hasta) {
    condiciones.push(`${columna} <= ?`);
    params.push(fecha_hasta);
  }
  return { condiciones, params };
}

async function turnosPorEspecialidad(req, res) {
  const { fecha_desde, fecha_hasta } = req.query;
  const { condiciones, params } = filtroFechas(fecha_desde, fecha_hasta, 't.fecha');
  const filtroJoin = condiciones.length ? `AND ${condiciones.join(' AND ')}` : '';

  try {
    const [rows] = await pool.query(
      `SELECT e.id AS id_especialidad, e.descripcion, COUNT(t.id) AS cantidad_turnos
       FROM especialidad e
       LEFT JOIN agenda a ON a.id_especialidad = e.id
       LEFT JOIN turno t ON t.id_agenda = a.id ${filtroJoin}
       GROUP BY e.id, e.descripcion
       ORDER BY cantidad_turnos DESC`,
      params
    );
    res.json({ codigo: 200, estado: 'ok', datos: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al obtener el reporte de turnos por especialidad', datos: null });
  }
}

async function turnosPorSede(req, res) {
  const { fecha_desde, fecha_hasta } = req.query;
  const { condiciones, params } = filtroFechas(fecha_desde, fecha_hasta, 't.fecha');
  const filtroJoin = condiciones.length ? `AND ${condiciones.join(' AND ')}` : '';

  try {
    const [rows] = await pool.query(
      `SELECT s.id AS id_sede, s.nombre, COUNT(t.id) AS cantidad_turnos
       FROM sede s
       LEFT JOIN agenda a ON a.id_sede = s.id
       LEFT JOIN turno t ON t.id_agenda = a.id ${filtroJoin}
       GROUP BY s.id, s.nombre
       ORDER BY cantidad_turnos DESC`,
      params
    );
    res.json({ codigo: 200, estado: 'ok', datos: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al obtener el reporte de turnos por sede', datos: null });
  }
}

async function rankingMedicos(req, res) {
  const { fecha_desde, fecha_hasta } = req.query;
  const { condiciones, params } = filtroFechas(fecha_desde, fecha_hasta, 't.fecha');
  const filtroJoin = condiciones.length ? `AND ${condiciones.join(' AND ')}` : '';

  try {
    const [rows] = await pool.query(
      `SELECT u.id AS id_medico, u.nombre, u.apellido, COUNT(t.id) AS cantidad_turnos_atendidos
       FROM usuario u
       LEFT JOIN agenda a ON a.id_medico = u.id
       LEFT JOIN turno t ON t.id_agenda = a.id AND t.estado = 'atendido' ${filtroJoin}
       WHERE u.rol = 'medico'
       GROUP BY u.id, u.nombre, u.apellido
       ORDER BY cantidad_turnos_atendidos DESC`,
      params
    );
    res.json({ codigo: 200, estado: 'ok', datos: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al obtener el ranking de médicos', datos: null });
  }
}

async function tasaCancelacion(req, res) {
  const { fecha_desde, fecha_hasta } = req.query;
  const { condiciones, params } = filtroFechas(fecha_desde, fecha_hasta, 'fecha');
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  try {
    const [rows] = await pool.query(
      `SELECT
         COUNT(*) AS total_turnos,
         SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) AS turnos_cancelados
       FROM turno
       ${where}`,
      params
    );

    const totalTurnos = rows[0].total_turnos;
    const turnosCancelados = rows[0].turnos_cancelados || 0;
    const tasa = totalTurnos > 0 ? Number(((turnosCancelados / totalTurnos) * 100).toFixed(2)) : 0;

    res.json({
      codigo: 200,
      estado: 'ok',
      datos: { total_turnos: totalTurnos, turnos_cancelados: turnosCancelados, tasa_cancelacion: tasa }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al obtener la tasa de cancelación', datos: null });
  }
}

module.exports = { turnosPorEspecialidad, turnosPorSede, rankingMedicos, tasaCancelacion };
