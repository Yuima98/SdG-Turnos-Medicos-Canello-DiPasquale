const express = require('express');
const router = express.Router();
const { altaTurno } = require('../controllers/turnoController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

router.post('/', verificarToken, verificarRol('paciente', 'operador'), altaTurno);

module.exports = router;