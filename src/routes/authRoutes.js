const express = require('express');
const router = express.Router();
const { registro, login, perfil } = require('../controllers/authController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

router.post('/registro', registro);
router.post('/login', login);
router.get('/perfil', verificarToken, verificarRol('paciente'), perfil);

module.exports = router;