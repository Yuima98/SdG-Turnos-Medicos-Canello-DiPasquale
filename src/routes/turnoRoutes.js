const express = require('express');
const router = express.Router();
const { altaTurno, listarTurnos, cancelarTurno, atenderTurno } = require('../controllers/turnoController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

router.post('/', verificarToken, verificarRol('paciente', 'operador'), altaTurno);
router.get('/', verificarToken, verificarRol('paciente', 'medico', 'operador'), listarTurnos);
router.patch('/:id/cancelar', verificarToken, verificarRol('paciente', 'operador', 'medico'), cancelarTurno);
router.patch('/:id/atender', verificarToken, verificarRol('medico'), atenderTurno);

module.exports = router;
