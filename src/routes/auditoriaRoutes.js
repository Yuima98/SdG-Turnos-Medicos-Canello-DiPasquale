const express = require('express');
const router = express.Router();
const { listarAuditoria } = require('../controllers/auditoriaController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

router.get('/', verificarToken, verificarRol('admin'), listarAuditoria);

module.exports = router;
