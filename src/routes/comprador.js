const express = require('express');
const router = express.Router();
const pool = require('../../db'); 

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verificarToken = require('../middleware/auth');


//Registrar Comprador
router.post('/comprador/registrar', async (req, res) => {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        const result = await pool.query(
            'INSERT INTO usuarios (nombre, correo, contrasena, activo, tipo) VALUES ($1, $2, $3, true, 2) RETURNING *',
            [nombre, correo, hashedPassword]
        );

        res.status(201).json({ message: 'Comprador registrado', usuario: result.rows[0] });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});