const express = require('express');
const router = express.Router();
const {
  listarCoberturas,
  altaCobertura,
  modificarCobertura,
  bajaCobertura
} = require('../controllers/coberturaController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

router.get('/', listarCoberturas);
router.post('/', verificarToken, verificarRol('admin'), altaCobertura);
router.put('/:id', verificarToken, verificarRol('admin'), modificarCobertura);
router.delete('/:id', verificarToken, verificarRol('admin'), bajaCobertura);

module.exports = router;