const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('CALL sp_read_users()');
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/usuarios/clientes - Obtener solo usuarios de tipo 'cliente'
router.get('/clientes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id_usuario, nombre FROM usuarios WHERE tipo = \'cliente\' AND estado = \'activo\'');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/usuarios - Crear un nuevo usuario
router.post('/', async (req, res) => {
  const { nombre, email, telefono, direccion, tipo } = req.body;
  try {
    await db.query('CALL sp_create_user(?, ?, ?, ?, ?)', [nombre, email, telefono, direccion, tipo]);
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/usuarios/:id - Actualizar un usuario
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono, direccion, tipo } = req.body;
  try {
    await db.query('CALL sp_update_user(?, ?, ?, ?, ?, ?)', [id, nombre, email, telefono, direccion, tipo]);
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/usuarios/:id - Eliminar (lógicamente) un usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('CALL sp_delete_user(?)', [id]);
    res.json({ message: 'Usuario eliminado (inactivo) exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
