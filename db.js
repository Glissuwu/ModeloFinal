const mysql = require('mysql2');

// Configura la conexión a la base de datos
// IMPORTANTE: Reemplaza estos valores con tus credenciales de MySQL
const connection = mysql.createConnection({
  host: 'localhost', // O la IP de tu servidor de base de datos
  user: 'root',      // Tu usuario de MySQL
  password: '', // Tu contraseña de MySQL
  database: 'sistema_ventas'
});

// Conecta a la base de datos
connection.connect(error => {
  if (error) {
    console.error('Error al conectar a la base de datos:', error);
    return;
  }
  console.log('Conexión exitosa a la base de datos MySQL.');
});

module.exports = connection.promise();
