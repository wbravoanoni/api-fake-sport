const express = require('express');
const router = express.Router();
const pool = require('../db'); 


router.get('/categorias', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias'); 
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener categorias:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.get('/categorias/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM categorias WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener la categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

//Agregar nueva categoria
router.post('/categorias', async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ message: 'El nombre es obligatorio' });
    }
    try {
        const result = await pool.query('INSERT INTO categorias (nombre) VALUES ($1) RETURNING *', [nombre]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

//Editar una categoria
router.put('/categorias/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ message: 'El nombre es obligatorio' });
    }
    try {
        const result = await pool.query('UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *', [nombre, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json({ categoria: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

//Activar/Desactivar las categorias
router.put('/categorias/:id/toggle', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT activo FROM categorias WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        const nuevoEstado = !result.rows[0].activo;
        const updateResult = await pool.query(
            'UPDATE categorias SET activo = $1 WHERE id = $2 RETURNING *',
            [nuevoEstado, id]
        );

        res.json({
            message: `Categoría ${nuevoEstado ? 'activada' : 'desactivada'} correctamente`,
            categoria: updateResult.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar estado de la categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

//Eliminar categorias
router.delete('/categorias/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});



module.exports = router;