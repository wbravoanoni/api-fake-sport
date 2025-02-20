const express = require('express');
const router = express.Router();
const pool = require('../db'); 


router.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios'); 
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;