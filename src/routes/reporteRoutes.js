const express = require('express');
const router = express.Router();
const {
  turnosPorEspecialidad,
  turnosPorSede,
  rankingMedicos,
  tasaCancelacion
} = require('../controllers/reporteController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

router.get('/turnos-por-especialidad', verificarToken, verificarRol('admin'), turnosPorEspecialidad);
router.get('/turnos-por-sede', verificarToken, verificarRol('admin'), turnosPorSede);
router.get('/ranking-medicos', verificarToken, verificarRol('admin'), rankingMedicos);
router.get('/tasa-cancelacion', verificarToken, verificarRol('admin'), tasaCancelacion);

module.exports = router;
