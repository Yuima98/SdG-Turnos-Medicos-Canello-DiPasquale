const express = require('express');
const router = express.Router();
const { altaSede, listarSedes, modificarSede, bajaSede } = require('../controllers/sedeController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

router.post('/', verificarToken, verificarRol('admin'), altaSede);
router.get('/', verificarToken, verificarRol('admin'), listarSedes);
router.put('/:id', verificarToken, verificarRol('admin'), modificarSede);
router.delete('/:id', verificarToken, verificarRol('admin'), bajaSede);

module.exports = router;