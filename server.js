const express = require('express');
const path = require('path');
const userRoutes = require('./routes/usuarios');
const ventaRoutes = require('./routes/ventas');
const productRoutes = require('./routes/productos');

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use('/api/usuarios', userRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/productos', productRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
