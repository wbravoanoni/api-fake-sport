const express = require('express');
const router = express.Router();
const pool = require('../../db'); 

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verificarToken = require('../middleware/auth');



// Lista de categorías con paginación (SOLO ADMIN)
router.get('/privado/productos', verificarToken, async (req, res) => {
    if (!req.user.activo) {
        return res.status(403).json({ message: 'Acceso denegado: Usuario inactivo' });
    }

    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden ver los productos' });
    }
    
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const offset = (page - 1) * limit;

    try {
        const result = await pool.query(
            'SELECT id, id_categoria,precio,cantidad,descuento, activo,nombre FROM productos ORDER BY id LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        const totalProductos = await pool.query('SELECT COUNT(*) FROM productos');
        const totalPaginas = Math.ceil(parseInt(totalProductos.rows[0].count, 10) / limit);

        res.json({
            page,
            totalPaginas,
            totalProductos: parseInt(totalProductos.rows[0].count, 10),
            productos: result.rows, 
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.post('/privado/productos', verificarToken, async (req, res) => {
    if (!req.user.activo || req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden agregar productos' });
    }
    
    console.log("Token recibido:", req.headers.authorization);
    console.log("Datos recibidos en req.body:", req.body);
    
    const { id_categoria, nombre, descripcion, talla, color, precio, cantidad, descuento, imagen, activo } = req.body;

    if (!nombre || !id_categoria || !precio || !cantidad) {
        console.log("Error: Faltan campos obligatorios");
        return res.status(400).json({ message: 'Los campos nombre, id_categoria, precio y cantidad son obligatorios' });
    }

    try {
        console.log("Ejecutando consulta SQL...");
        const result = await pool.query(
            'INSERT INTO productos (id_categoria, nombre, descripcion, talla, color, precio, cantidad, descuento, imagen, activo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [id_categoria, nombre, descripcion, talla, color, precio, cantidad, descuento, imagen, activo]
        );
        console.log("Producto creado con éxito:", result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});


router.get('/productos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos WHERE activo = true'); // Solo productos activos
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.get('/productos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM productos WHERE id = $1 AND activo = true', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado o inactivo' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


// Obtener productos por categoría (PÚBLICO)
router.get('/productos/categoria/:nombre', async (req, res) => {
    const { nombre } = req.params; // Obtener el nombre de la categoría desde la URL

    try {
        const result = await pool.query(
            `SELECT p.* 
             FROM productos p
             INNER JOIN categorias c ON p.id_categoria = c.id
             WHERE c.nombre = $1 AND c.activo = true AND p.activo = true`, 
            [nombre]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron productos para esta categoría' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener productos por categoría:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.put('/privado/productos/:id/toggle', verificarToken, async (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo los administradores pueden ACTIVAR/DESACTIVAR productos' });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const result = await pool.query('SELECT activo FROM productos WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const nuevoEstado = result.rows[0].activo ? false : true;

        const updateResult = await pool.query(
            'UPDATE productos SET activo = $1 WHERE id = $2 RETURNING *',
            [nuevoEstado, id]
        );

        res.json({
            message: `Producto ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
            producto: updateResult.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar estado del producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});



module.exports = router;
