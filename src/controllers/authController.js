const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

async function login(req, res) {
  const { dni, password } = req.body;

  if (!dni || !password) {
    return res.status(400).json({ codigo: 400, estado: 'dni y contraseña son requeridos', datos: null });
  }

  try {
    const [usuarios] = await pool.query('SELECT * FROM usuario WHERE dni = ?', [dni]);
    if (usuarios.length === 0) {
      return res.status(401).json({ codigo: 401, estado: 'credenciales inválidas', datos: null });
    }

    const usuario = usuarios[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ codigo: 401, estado: 'credenciales inválidas', datos: null });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, id_sede: usuario.id_sede },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ codigo: 200, estado: 'ok', datos: { token } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al iniciar sesión', datos: null });
  }
}

async function perfil(req, res) {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, nombre, apellido, dni, email, fecha_nacimiento, telefono, rol, id_sede, id_cobertura FROM usuario WHERE id = ?',
      [req.usuario.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ codigo: 404, estado: 'usuario no encontrado', datos: null });
    }

    res.json({ codigo: 200, estado: 'ok', datos: usuarios[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ codigo: 500, estado: 'error al obtener perfil', datos: null });
  }
}

module.exports = { registro, login, perfil };