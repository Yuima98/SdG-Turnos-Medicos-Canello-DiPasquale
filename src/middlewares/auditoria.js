const { registrarAuditoria } = require('../utils/auditoria');

/**
 * Mapea prefijos de ruta a la entidad auditada. Se recorre en orden y se usa
 * el primer prefijo que matchea, por eso '/auth/registro' va antes que
 * cualquier prefijo más general de '/auth'.
 */
const ENTIDADES_POR_RUTA = [
  { prefix: '/auth/registro', entidad: 'usuario' },
  { prefix: '/sedes', entidad: 'sede' },
  { prefix: '/especialidades', entidad: 'especialidad' },
  { prefix: '/coberturas', entidad: 'cobertura' }
];

const ACCION_POR_METODO = { POST: 'ALTA', PUT: 'MODIFICACION', DELETE: 'BAJA' };

function resolverEntidad(path) {
  const match = ENTIDADES_POR_RUTA.find((r) => path.startsWith(r.prefix));
  return match ? match.entidad : null;
}

function armarDetalle(entidad, accion, req, idEntidad) {
  if (entidad === 'usuario') {
    return `Alta de paciente ${req.body?.nombre ?? ''} ${req.body?.apellido ?? ''} (autoregistro)`.trim();
  }
  if (accion === 'BAJA') {
    return `Baja de ${entidad} id ${idEntidad}`;
  }
  const campoDescriptivo = req.body?.nombre ?? req.body?.descripcion ?? null;
  const verbo = accion === 'ALTA' ? 'Alta' : 'Modificación';
  return campoDescriptivo
    ? `${verbo} de ${entidad} "${campoDescriptivo}"`
    : `${verbo} de ${entidad} id ${idEntidad}`;
}

/**
 * Middleware global: audita automáticamente cada alta/baja/modificación exitosa
 * sobre usuarios, coberturas, especialidades y sedes, sin que cada controller
 * tenga que llamar a registrarAuditoria() por su cuenta.
 */
function auditar(req, res, next) {
  const accion = ACCION_POR_METODO[req.method];
  const entidad = resolverEntidad(req.path);

  if (!accion || !entidad) {
    return next();
  }

  const resJsonOriginal = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const idEntidad = req.params.id ?? body?.datos?.id ?? null;
      const idUsuario = req.usuario ? req.usuario.id : idEntidad; // autoregistro: todavía no hay token
      registrarAuditoria({
        id_usuario: idUsuario,
        accion,
        entidad,
        id_entidad: idEntidad,
        detalle: armarDetalle(entidad, accion, req, idEntidad)
      });
    }
    return resJsonOriginal(body);
  };

  next();
}

module.exports = auditar;