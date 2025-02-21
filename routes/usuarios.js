const express = require('express');
const router = express.Router();
const pool = require('../db'); 

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verificarToken = require('../middleware/auth');


//Registrar usuarios
router.post('/usuarios/registrar', async (req, res) => {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        const result = await pool.query(
            'INSERT INTO usuarios (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING *',
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

        // Comparar contraseñas
        const comparaContrasenas = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!comparaContrasenas) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Generar Token JWT
        const token = jwt.sign({ id: usuario.id, correo: usuario.correo }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Lista de usuarios (PROTEGIDO)
router.get('/usuarios', verificarToken, async (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden ver los usuarios' });
    }

    try {
        const result = await pool.query('SELECT id, nombre, correo, tipo FROM usuarios');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;