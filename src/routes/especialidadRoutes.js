const express = require('express');
const router = express.Router();
const {
  altaEspecialidad,
  listarEspecialidades,
  modificarEspecialidad,
  bajaEspecialidad
} = require('../controllers/especialidadController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

router.post('/', verificarToken, verificarRol('admin'), altaEspecialidad);
router.get('/', verificarToken, verificarRol('admin'), listarEspecialidades);
router.put('/:id', verificarToken, verificarRol('admin'), modificarEspecialidad);
router.delete('/:id', verificarToken, verificarRol('admin'), bajaEspecialidad);

module.exports = router;