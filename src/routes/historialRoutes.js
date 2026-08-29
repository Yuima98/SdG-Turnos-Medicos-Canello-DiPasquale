const express = require('express');
const router = express.Router();
const { altaHistorial, consultarHistorial } = require('../controllers/historialController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

router.post('/', verificarToken, verificarRol('medico'), altaHistorial);
router.get('/paciente/:id_paciente', verificarToken, verificarRol('paciente', 'medico'), consultarHistorial);

module.exports = router;
