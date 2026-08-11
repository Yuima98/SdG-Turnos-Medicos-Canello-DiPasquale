const bcrypt = require('bcrypt');
const pool = require('../database/db');

async function registro(req, res) {
  const { nombre, apellido, dni, email, password, fecha_nacimiento, telefono, id_cobertura } = req.body;

  try {
    const [dniExistente] = await pool.query('SELECT id FROM usuario WHERE dni = ?', [dni]);
    if (dniExistente.length > 0) {
      return res.status(409).json({ codigo: 409, estado: 'el DNI ya está registrado', datos: null });
    }

    const [emailExistente] = await pool.query('SELECT id FROM usuario WHERE email = ?', [email]);
    if (emailExistente.length > 0) {
      return res.status(409).json({ codigo: 409, estado: 'el email ya está registrado', datos: null });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [resultado] = await pool.query(
      `INSERT INTO usuario (nombre, apellido, dni, email, password, fecha_nacimiento, telefono, id_cobertura, rol)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paciente')`,
      [nombre, apellido, dni, email, passwordHash, fecha_nacimiento, telefono, id_cobertura]
    );

    res.status(201).json({ codigo: 201, estado: 'ok', datos: { id: resultado.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al registrar usuario', datos: null });
  }
}

module.exports = { registro };