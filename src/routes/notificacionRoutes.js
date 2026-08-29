const express = require('express');
const router = express.Router();
const { listarNotificaciones, marcarLeida } = require('../controllers/notificacionController');
const verificarToken = require('../middlewares/verificarToken');

router.get('/', verificarToken, listarNotificaciones);
router.patch('/:id/leida', verificarToken, marcarLeida);

module.exports = router;
