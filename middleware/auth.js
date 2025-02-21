const jwt = require('jsonwebtoken');
const pool = require('../db'); // Para acceder a la base de datos

const verificarToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Token requerido' });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query('SELECT tipo FROM usuarios WHERE id = $1', [decoded.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        req.user = { id: decoded.id, correo: decoded.correo, tipo: result.rows[0].tipo };

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = verificarToken;
