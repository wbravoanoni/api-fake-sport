const express = require('express');
const router = express.Router();
const pool = require('../../db'); 

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verificarToken = require('../middleware/auth');


// Lista de categorias (PROTEGIDO)
router.get('/categorias', verificarToken, async (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden LISTAR las categorias' });
    }
    try {
        const result = await pool.query('SELECT * FROM categorias'); 
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener categorias:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// ver categorias (PROTEGIDO)
router.get('/categorias/:id', verificarToken, async (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden VER esta categorias' });
    }

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

// Lista de categorías con paginación (SOLO ADMIN)
router.get('/categorias', verificarToken, async (req, res) => {
    if (!req.user.activo) {
        return res.status(403).json({ message: 'Acceso denegado: Usuario inactivo' });
    }

    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden ver las categorías' });
    }
    
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const offset = (page - 1) * limit;

    try {
        // Consulta SQL corregida
        const result = await pool.query(
            'SELECT id, nombre, fecha_creacion, fecha_actualizacion, activo FROM categorias ORDER BY id LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        // Obtener total de categorías
        const totalCategorias = await pool.query('SELECT COUNT(*) FROM categorias');
        const totalPaginas = Math.ceil(parseInt(totalCategorias.rows[0].count, 10) / limit);

        res.json({
            page,
            totalPaginas,
            totalCategorias: parseInt(totalCategorias.rows[0].count, 10),
            categorias: result.rows, 
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

//Activar/Desactivar las categorias (PROTEGIDO)
router.put('/categorias/:id/toggle', verificarToken, async (req, res) => {

    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden ACTIVAR/DESACTIVAR las categorias' });
    }

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

//Eliminar categorias (PROTEGIDO)
router.delete('/categorias/:id', verificarToken,async (req, res) => {

    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden ELIMINAR categorias' });
    }

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