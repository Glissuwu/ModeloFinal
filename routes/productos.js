const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/productos - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id_producto, nombre, precio, stock FROM productos WHERE stock > 0');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
