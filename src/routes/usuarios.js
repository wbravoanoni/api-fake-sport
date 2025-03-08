const express = require('express');
const router = express.Router();
const pool = require('../../db'); 

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verificarToken = require('../middleware/auth');


//Registrar usuarios (solo administradores logeados)
router.post('/usuarios/registrar', verificarToken, async (req, res) => {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        const result = await pool.query(
            'INSERT INTO usuarios (nombre, correo, contrasena, activo, tipo) VALUES ($1, $2, $3, true, 1) RETURNING *',
            [nombre, correo, hashedPassword]
        );

        res.status(201).json({ message: 'Usuario registrado', usuario: result.rows[0] });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// loggin de Usuario
router.post('/usuarios/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const usuario = result.rows[0];

        if (!usuario.activo) { // ✅ Corregido: Se usa `usuario` en lugar de `req.user`
            return res.status(403).json({ message: 'Acceso denegado: Usuario inactivo' });
        }

        const comparaContrasenas = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!comparaContrasenas) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: usuario.id, correo: usuario.correo, tipo: usuario.tipo, activo: usuario.activo }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                tipo: usuario.tipo,
                activo: usuario.activo
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Lista de usuarios con paginación (SOLO ADMIN)
router.get('/usuarios', verificarToken, async (req, res) => {
    if (!req.user.activo) {
        return res.status(403).json({ message: 'Acceso denegado: Usuario inactivo' });
    }

    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden ver los usuarios' });
    }
    
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const offset = (page - 1) * limit;

    try {
        const result = await pool.query(
            'SELECT id, nombre, correo, tipo FROM usuarios ORDER BY id LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        const totalUsuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
        const totalPaginas = Math.ceil(totalUsuarios.rows[0].count / limit);

        res.json({
            page,
            totalPaginas,
            totalUsuarios: totalUsuarios.rows[0].count,
            usuarios: result.rows,
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


// Modificar un usuario (PROTEGIDO)
router.put('/usuarios/:id', verificarToken, async (req, res) => {

    if (!req.user.activo) {
        return res.status(403).json({ message: 'Acceso denegado: Usuario inactivo' });
    }

    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden modificar usuarios' });
    }

    const { id } = req.params;
    const { nombre, correo, tipo } = req.body;

    try {
        const result = await pool.query(
            'UPDATE usuarios SET nombre = $1, correo = $2, tipo = $3 WHERE id = $4 RETURNING *',
            [nombre, correo, tipo, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado correctamente', usuario: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Activar/Desactivar usuario (PROTEGIDO)
router.put('/usuarios/:id/toggle', verificarToken, async (req, res) => {

    if (!req.user.activo) {
        return res.status(403).json({ message: 'Acceso denegado: Usuario inactivo' });
    }

    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden activar/desactivar usuarios' });
    }

    const { id } = req.params;

    try {
        const result = await pool.query('SELECT activo FROM usuarios WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const nuevoEstado = !result.rows[0].activo;
        const updateResult = await pool.query(
            'UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING *',
            [nuevoEstado, id]
        );

        res.json({
            message: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
            usuario: updateResult.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar estado del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// 
// Eliminar usuario (PROTEGIDO)
router.delete('/usuarios/:id', verificarToken, async (req, res) => {
    
    if (!req.user.activo) {
        return res.status(403).json({ message: 'Acceso denegado: Usuario inactivo' });
    }

    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden eliminar usuarios' });
    }

    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;
