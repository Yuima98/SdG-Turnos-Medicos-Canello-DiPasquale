const express = require('express');
const router = express.Router();
const { registro } = require('../controllers/authController');

router.post('/registro', registro);

module.exports = router;