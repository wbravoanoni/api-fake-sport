const request = require('supertest');
const app = require('../server');

describe('************* Pruebas de la API de Categorías *************', () => {
    
    let categoriaId;
    let token; //Guaradar el token


    // Antes de correr los tests, hacer login y obtener el token
    beforeAll(async () => {
        const res = await request(app)
            .post('/api/usuarios/login') // Ruta de login
            .send({ correo: 'administrador@coreo.cl', contrasena: '123456' });

        token = res.body.token; // iMPROTANTE token
    });
    
    //Prueba 1 - Crear una nueva categoría (PROTEGIDAS)
    test('Metodo: POST - Ruta: /api/categorias - Debe crear una nueva categoría', async () => {
        const res = await request(app)
            .post('/api/categorias')
            .send({ nombre: 'Test Categoría' })
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json');

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.nombre).toBe('Test Categoría');

        categoriaId = res.body.id;
    });

    // Prueba 2 - Obtener todos las categorias (PROTEGIDAS)
    test('Metodo: GET - Ruta: /api/categorias - Debe retornar una lista de categorías', async () => {
        const res = await request(app)
            .get('/api/categorias')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // Prueba 3 - Obtener una categoria por id (PROTEGIDAS)
    test('Metodo: GET - Ruta: /api/categorias/:id - Debe retornar una categoría existente', async () => {
        const res = await request(app)
            .get(`/api/categorias/${categoriaId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', categoriaId);
    });

    test('Metodo: GET - Ruta: /api/categorias/:id - Debe retornar 404 si la categoría no existe', async () => {
        const res = await request(app)
            .get('/api/categorias/9999')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
    });

    // Prueba 4 - Actualizar una categoria (PROTEGIDAS)
    test('Metodo: PUT - Ruta: /api/categorias/:id - Debe actualizar el nombre de una categoría', async () => {
        const res = await request(app)
            .put(`/api/categorias/${categoriaId}`)
            .send({ nombre: 'Categoría Actualizada' })
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json');

        expect(res.statusCode).toBe(200);
        expect(res.body.categoria.nombre).toBe('Categoría Actualizada');
    });

    // Prueba 5 - Activar/Desactivar una categoría (PROTEGIDAS)
    test('Metodo: PUT - Ruta: /api/categorias/:id/toggle - Debe cambiar el estado de activo', async () => {
        const res1 = await request(app)
            .put(`/api/categorias/${categoriaId}/toggle`)
            .set('Authorization', `Bearer ${token}`);

        expect(res1.statusCode).toBe(200);
        expect(res1.body.categoria).toHaveProperty('activo');

        const estadoInicial = res1.body.categoria.activo;

        // Revertir estado de la categoría (PROTEGIDAS)
        const res2 = await request(app)
            .put(`/api/categorias/${categoriaId}/toggle`)
            .set('Authorization', `Bearer ${token}`);

        expect(res2.statusCode).toBe(200);
        expect(res2.body.categoria.activo).toBe(!estadoInicial);
    });

    // Prueba 6 - Eliminar una categoria (PROTEGIDAS)
    test('Metodo: DELETE - Ruta: /api/categorias/:id - Debe eliminar una categoría', async () => {
        const res = await request(app)
            .delete(`/api/categorias/${categoriaId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });

    test('Metodo: DELETE - Ruta: /api/categorias/:id - Debe retornar 404 si la categoría ya fue eliminada', async () => {
        const res = await request(app)
            .delete(`/api/categorias/${categoriaId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
    });

});