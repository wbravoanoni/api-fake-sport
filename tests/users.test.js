const request = require('supertest');
const app = require('../server');

describe('Pruebas de la API de Usuarios', () => {
    
    // 1. Test para obtener todos los usuarios
    test('GET /api/users - Debe retornar código 200 y una lista de usuarios', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // 2. Test para obtener un usuario por ID
    test('GET /api/users/:id - Debe retornar código 200 si el usuario existe', async () => {
        const res = await request(app).get('/api/users/1'); // Suponiendo que el ID 1 existe
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
    });

    test('GET /api/users/:id - Debe retornar código 404 si el usuario no existe', async () => {
        const res = await request(app).get('/api/users/9999'); // ID que no existe
        expect(res.statusCode).toBe(404);
    });

    // 3. Test para crear un usuario
    test('POST /api/users - Debe retornar código 201 al crear un usuario', async () => {
        const newUser = { nombre: 'Carlos', email: 'carlos@example.com' };
        const res = await request(app).post('/api/users').send(newUser);
        expect(res.statusCode).toBe(201);
    });

    test('POST /api/users - Debe retornar código 400 si faltan datos', async () => {
        const newUser = { nombre: '' }; // Falta el email
        const res = await request(app).post('/api/users').send(newUser);
        expect(res.statusCode).toBe(400);
    });

    // 4. Test para eliminar un usuario
    test('DELETE /api/users/:id - Debe retornar código 200 si el usuario se elimina', async () => {
        const res = await request(app).delete('/api/users/1'); // Suponiendo que el ID 1 existe
        expect(res.statusCode).toBe(200);
    });

    test('DELETE /api/users/:id - Debe retornar código 404 si el usuario no existe', async () => {
        const res = await request(app).delete('/api/users/9999'); // ID que no existe
        expect(res.statusCode).toBe(404);
    });

});
