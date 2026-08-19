const express = require('express');
const router = express.Router();
const {
  altaAgenda,
  listarAgenda,
  modificarAgenda,
  bajaAgenda
} = require('../controllers/agendaController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

router.post('/', verificarToken, verificarRol('medico', 'operador'), altaAgenda);
router.get('/', verificarToken, verificarRol('medico', 'operador'), listarAgenda);
router.put('/:id', verificarToken, verificarRol('medico', 'operador'), modificarAgenda);
router.delete('/:id', verificarToken, verificarRol('medico', 'operador'), bajaAgenda);

module.exports = router;
