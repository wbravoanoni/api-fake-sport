const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Neon requiere SSL
});

pool.connect()
    .then(() => console.log('📡 Conexión exitosa a PostgreSQL en Neon'))
    .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err));

module.exports = pool;
