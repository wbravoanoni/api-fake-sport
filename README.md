## Rutas disponibles en el backend

----

### Agregar Usuario
#### Método: POST

https://api-fake-sport.onrender.com/api/usuarios/registrar

<code>{
  "nombre":"adminitrador",
  "correo":"administrador@coreo.cl",
  "contrasena":"123456"
}</code>

----

### Ingresar a la plataforma
#### Método: POST

https://api-fake-sport.onrender.com/api/usuarios/login

<code>{
  "correo":"administrador@coreo.cl",
  "contrasena":"123456"
}</code>

----

### Listar usuarios protegidos por token
#### Método: GET

https://api-fake-sport.onrender.com/api/usuarios/

Headers:
Authorization: Bearer <TOKEN>

----

### Agregar categorias
#### Método: POST

https://api-fake-sport.onrender.com/api/categorias

Headers:
Authorization: Bearer <TOKEN>

<code>{
  "nombre": "pruebanueva"
</code>}

----

### Listar categorias
#### Método: GET

https://api-fake-sport.onrender.com/api/categorias

Headers:
Authorization: Bearer <TOKEN>

----

### Editar categoria
#### Método: PUT

https://api-fake-sport.onrender.com/api/categorias/29

Headers:
Authorization: Bearer <TOKEN>

<code>{
  "nombre": "pruebanueva2"
</code>}

----

### Modificar estado de una categorias
#### Método: PUT

https://api-fake-sport.onrender.com/api/categorias/29/toggle

Headers:
Authorization: Bearer <TOKEN>

----

### Eliminar una categoria
#### Método: DELETE

https://api-fake-sport.onrender.com/api/categorias/29

Headers:
Authorization: Bearer <TOKEN>

----

### Ver todos los productos
#### Método GET

https://api-fake-sport.onrender.com/api/productos

----

### Ver un productos
#### Método GET

https://api-fake-sport.onrender.com/api/productos

----

### Ver productos por categorias
#### Método GET

https://api-fake-sport.onrender.com/api/productos/categoria/Hombre

----

### Insertar Productos
#### Metodo POST

https://api-fake-sport.onrender.com/api/privado/productos

<code>
  {
  "id_categoria": 1,
  "nombre": "Camiseta Deportiva",
  "descripcion": "Camiseta para entrenamiento",
  "talla": "M",
  "color": "Rojo",
  "precio": 19990,
  "cantidad": 50,
  "descuento": 10,
  "imagen": "url_imagen",
  "activo": true
}
</code>

Authorization: Bearer <token>

### listar productos paginados
#### Metodo POST

https://api-fake-sport.onrender.com/api/productos?page=1&limit=1

Authorization: Bearer <token>


