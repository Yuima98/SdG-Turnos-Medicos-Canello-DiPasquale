/**
 * Helpers para trabajar con horas en formato "HH:MM" (varchar(5) en la BDD)
 * como minutos desde medianoche.
 * - sumarMinutos: calcula el fin de un turno (hora + duración).
 * - minutosEntre: calcula el gap entre dos horas (usado para el mínimo de 30 min entre sedes).
 */

function aMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function sumarMinutos(hora, minutos) {
  const total = aMinutos(hora) + minutos;
  const h = Math.floor(total / 60).toString().padStart(2, '0');
  const m = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function minutosEntre(horaInicio, horaFin) {
  return aMinutos(horaFin) - aMinutos(horaInicio);
}

/**
 * mysql2 devuelve las columnas DATE como objetos Date (en hora local);
 * esto arma el "YYYY-MM-DD" usando los getters locales para no correrse de día.
 */
function formatearFecha(fecha) {
  if (fecha instanceof Date) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return fecha;
}

module.exports = { aMinutos, sumarMinutos, minutosEntre, formatearFecha };