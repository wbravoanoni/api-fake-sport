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

### Ver productos por categorias
#### Método GET

https://api-fake-sport.onrender.com/api/productos/categoria/Hombre

----
