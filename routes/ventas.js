const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/ventas/factura - Crear una nueva factura
router.post('/factura', async (req, res) => {
  const { id_usuario } = req.body;
  try {
    const [result] = await db.query('CALL sp_create_invoice(?, @p_id_factura)', [id_usuario]);
    const [[{ '@p_id_factura': id_factura }]] = await db.query('SELECT @p_id_factura');
    res.status(201).json({ message: 'Factura creada exitosamente', id_factura: id_factura });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ventas/detalle - Agregar producto a una factura
router.post('/detalle', async (req, res) => {
  const { id_factura, id_producto, cantidad } = req.body;
  try {
    await db.query('CALL sp_add_product_to_invoice(?, ?, ?)', [id_factura, id_producto, cantidad]);
    res.status(201).json({ message: 'Producto agregado a la factura exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/ventas/detalle/:id_detalle - Eliminar producto de una factura
router.delete('/detalle/:id_detalle', async (req, res) => {
  const { id_detalle } = req.params;
  try {
    await db.query('CALL sp_remove_product_from_invoice(?)', [id_detalle]);
    res.json({ message: 'Producto eliminado de la factura exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/facturas', async (req, res) => {
  try {
    const [rows] = await db.query('CALL sp_read_invoices_with_details()');
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
