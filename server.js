const express = require('express');
const pool = require('./db'); // Importa la conexión a la BD
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware para manejar JSON en requests

// Ruta de prueba que obtiene la fecha actual desde PostgreSQL
app.get('/fecha', async (req, res) => {
    try {
        const res = await pool.query('SELECT * FROM usuarios');
        console.log('📊 Usuarios registrados:', res.rows);
    } catch (err) {
        console.error('❌ Error al obtener usuarios:', err);
    } finally {
        pool.end();
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
