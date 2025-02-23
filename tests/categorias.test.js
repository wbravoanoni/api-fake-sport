const request = require('supertest');
const app = require('../server');

describe('************* Pruebas de la API de Categorías *************', () => {
    
    let categoriaId;
    let tokenAdmin; // Token de administrador
    let tokenUsuario; // Token de usuario normal

    // Antes de correr los tests, hacer login y obtener los tokens
    beforeAll(async () => {
        // Login como Administrador (tipo = 1)
        const resAdmin = await request(app)
            .post('/api/usuarios/login')
            .send({ correo: 'administrador@coreo.cl', contrasena: '123456' });

        tokenAdmin = resAdmin.body.token;

        // Login como Usuario Normal (tipo = 2)
        const resUsuario = await request(app)
            .post('/api/usuarios/login')
            .send({ correo: 'usuario@coreo.cl', contrasena: '123456' });

        tokenUsuario = resUsuario.body.token;
    });

    //Prueba 1 - Crear una nueva categoría (Solo Admin)
    test('POST /api/categorias - Debe crear una nueva categoría (ADMIN)', async () => {
        const res = await request(app)
            .post('/api/categorias')
            .send({ nombre: 'Test Categoría' })
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .set('Content-Type', 'application/json');

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.nombre).toBe('Test Categoría');

        categoriaId = res.body.id;
    });

    test('POST /api/categorias - Debe retornar 403 si un usuario normal intenta crear una categoría', async () => {
        const res = await request(app)
            .post('/api/categorias')
            .send({ nombre: 'Categoría Bloqueada' })
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .set('Content-Type', 'application/json');

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Acceso denegado: Solo los administradores pueden AGREGAR categorias');
    });

    //Prueba2 - Obtener todas las categorías (Solo Admin)
    test('GET /api/categorias - Debe retornar lista de categorías (ADMIN)', async () => {
        const res = await request(app)
            .get('/api/categorias')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/categorias - Debe retornar 403 si un usuario normal intenta listar categorías', async () => {
        const res = await request(app)
            .get('/api/categorias')
            .set('Authorization', `Bearer ${tokenUsuario}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Acceso denegado: Solo los administradores pueden LISTAR las categorias');
    });

    // Prueba 3 - Obtener una categoría por ID (Solo Admin)
    test('GET /api/categorias/:id - Debe retornar una categoría existente (ADMIN)', async () => {
        const res = await request(app)
            .get(`/api/categorias/${categoriaId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', categoriaId);
    });

    test('GET /api/categorias/:id - Debe retornar 403 si un usuario normal intenta ver una categoría', async () => {
        const res = await request(app)
            .get(`/api/categorias/${categoriaId}`)
            .set('Authorization', `Bearer ${tokenUsuario}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Acceso denegado: Solo los administradores pueden VER esta categorias');
    });

    // Prueba 4 - Actualizar una categoría (Solo Admin)
    test('PUT /api/categorias/:id - Debe actualizar una categoría (ADMIN)', async () => {
        const res = await request(app)
            .put(`/api/categorias/${categoriaId}`)
            .send({ nombre: 'Categoría Actualizada' })
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .set('Content-Type', 'application/json');

        expect(res.statusCode).toBe(200);
        expect(res.body.categoria.nombre).toBe('Categoría Actualizada');
    });

    test('PUT /api/categorias/:id - Debe retornar 403 si un usuario normal intenta actualizar una categoría', async () => {
        const res = await request(app)
            .put(`/api/categorias/${categoriaId}`)
            .send({ nombre: 'Intento Fallido' })
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .set('Content-Type', 'application/json');

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Acceso denegado: Solo los administradores pueden EDITAR las categorias');
    });

    // Prueba 5 - Activar/Desactivar una categoría (Solo Admin)
    test('PUT /api/categorias/:id/toggle - Debe cambiar el estado de activo (ADMIN)', async () => {
        const res1 = await request(app)
            .put(`/api/categorias/${categoriaId}/toggle`)
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res1.statusCode).toBe(200);
        expect(res1.body.categoria).toHaveProperty('activo');

        const estadoInicial = res1.body.categoria.activo;

        // Revertir estado
        const res2 = await request(app)
            .put(`/api/categorias/${categoriaId}/toggle`)
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res2.statusCode).toBe(200);
        expect(res2.body.categoria.activo).toBe(!estadoInicial);
    });

    test('PUT /api/categorias/:id/toggle - Debe retornar 403 si un usuario normal intenta activar/desactivar una categoría', async () => {
        const res = await request(app)
            .put(`/api/categorias/${categoriaId}/toggle`)
            .set('Authorization', `Bearer ${tokenUsuario}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Acceso denegado: Solo los administradores pueden ACTIVAR/DESACTIVAR las categorias');
    });

    // Prueba 6 - Eliminar una categoría (Solo Admin)
    test('DELETE /api/categorias/:id - Debe eliminar una categoría (ADMIN)', async () => {
        const res = await request(app)
            .delete(`/api/categorias/${categoriaId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.statusCode).toBe(200);
    });

    test('DELETE /api/categorias/:id - Debe retornar 403 si un usuario normal intenta eliminar una categoría', async () => {
        const res = await request(app)
            .delete(`/api/categorias/${categoriaId}`)
            .set('Authorization', `Bearer ${tokenUsuario}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Acceso denegado: Solo los administradores pueden ELIMINAR categorias');
    });

});
