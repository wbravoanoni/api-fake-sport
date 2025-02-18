const express = require('express');
const app = express();
const PORT = 3000;

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// Ruta principal
app.get('/', (req, res) => {
    res.send('<h1>¡Hola, mundo desde Node.js!</h1>');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
