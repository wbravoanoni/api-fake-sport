const request = require('supertest');
const app = require('../server');

describe('************* Pruebas de la API de Usuarios *************', () => {
    
    let tokenAdmin, tokenUsuario, usuarioId;

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

        // Crear un usuario de prueba
        const resNuevoUsuario = await request(app)
            .post('/api/usuarios/registrar')
            .send({ nombre: 'Carlos', correo: 'carlos@example.com', contrasena: 'password123' })
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .set('Content-Type', 'application/json');

        usuarioId = resNuevoUsuario.body.usuario.id;
    });

    // Prueba N° 1: - Obtener todos los usuarios (Solo ADMIN)
    test('GET /api/usuarios - Solo los administradores pueden ver usuarios', async () => {
        const res = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/usuarios - Usuario normal NO debe poder ver usuarios', async () => {
        const res = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${tokenUsuario}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Acceso denegado: Solo los administradores pueden ver los usuarios');
    });

    //Prueba N° 2: -  Modificar un usuario (Solo ADMIN)
    test('PUT /api/usuarios/:id - Solo los administradores pueden modificar usuarios', async () => {
        const res = await request(app)
            .put(`/api/usuarios/${usuarioId}`)
            .send({ nombre: 'Carlos Modificado', correo: 'carlos_modificado@example.com', tipo: 2 })
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .set('Content-Type', 'application/json');

        expect(res.statusCode).toBe(200);
        expect(res.body.usuario.nombre).toBe('Carlos Modificado');
    });

    test('PUT /api/usuarios/:id - Usuario normal NO debe poder modificar usuarios', async () => {
        const res = await request(app)
            .put(`/api/usuarios/${usuarioId}`)
            .send({ nombre: 'Intento Fallido', correo: 'hack@example.com', tipo: 1 })
            .set('Authorization', `Bearer ${tokenUsuario}`)
            .set('Content-Type', 'application/json');

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Acceso denegado: Solo los administradores pueden modificar usuarios');
    });

    //Prueba N° 3: - Activar/Desactivar usuario (Solo ADMIN)
    test('PUT /api/usuarios/:id/toggle - Solo los administradores pueden activar/desactivar usuarios', async () => {
        const res1 = await request(app)
            .put(`/api/usuarios/${usuarioId}/toggle`)
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res1.statusCode).toBe(200);
        expect(res1.body.usuario).toHaveProperty('activo');

        const estadoInicial = res1.body.usuario.activo;

        const res2 = await request(app)
            .put(`/api/usuarios/${usuarioId}/toggle`)
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res2.statusCode).toBe(200);
        expect(res2.body.usuario.activo).toBe(!estadoInicial);
    });

    test('PUT /api/usuarios/:id/toggle - Usuario normal NO debe poder activar/desactivar usuarios', async () => {
        const res = await request(app)
            .put(`/api/usuarios/${usuarioId}/toggle`)
            .set('Authorization', `Bearer ${tokenUsuario}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Acceso denegado: Solo los administradores pueden activar/desactivar usuarios');
    });

    // Prueba N° 4: -  Eliminar un usuario (Solo ADMIN)
    test('DELETE /api/usuarios/:id - Solo los administradores pueden eliminar usuarios', async () => {
        const res = await request(app)
            .delete(`/api/usuarios/${usuarioId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.statusCode).toBe(200);
    });

    test('DELETE /api/usuarios/:id - Usuario normal NO debe poder eliminar usuarios', async () => {
        const res = await request(app)
            .delete(`/api/usuarios/${usuarioId}`)
            .set('Authorization', `Bearer ${tokenUsuario}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Acceso denegado: Solo los administradores pueden eliminar usuarios');
    });

});
