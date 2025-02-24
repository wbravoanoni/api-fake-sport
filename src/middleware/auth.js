const jwt = require('jsonwebtoken');
const pool = require('../../db'); // Para acceder a la base de datos

const verificarToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Token requerido' });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query('SELECT id, tipo, activo FROM usuarios WHERE id = $1', [decoded.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const usuario = result.rows[0];

        if (usuario.activo === false || usuario.activo === null) {
            console.log(`⚠️ Usuario ID ${usuario.id} intentó acceder pero está inactivo.`);
            return res.status(403).json({ message: 'Acceso denegado: Usuario inactivo' });
        }

        req.user = { id: decoded.id, correo: decoded.correo, tipo: usuario.tipo, activo: usuario.activo };

        next();
    } catch (err) {
        console.error('Error al verificar el token:', err);
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = verificarToken;
