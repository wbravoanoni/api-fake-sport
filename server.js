const express = require('express');
const cors = require('cors');
const usersRoutes = require('./routes/users');
const categoriasRoutes = require('./routes/categorias');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', usersRoutes);
app.use('/api', categoriasRoutes);

if (require.main === module) {
    app.listen(3000, () => {
        console.log('Servidor corriendo en http://localhost:3000');
    });
}

module.exports = app;
