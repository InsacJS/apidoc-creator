# Insac Apidoc

Crea el apidoc de las rutas de un servicio web según el formato que establece ApidocJS.

# Características

- Utiliza objetos con atributos Sequelize para indicar los datos de entrada (INPUT) y los datos de salida (OUTPUT).
- Crear la documentación de los modelos de la base de datos en formato MD (MarkDown).

## Propiedades INPUT y OUTPUT.

``` js
const input = {
  query: FIELD,
  headers: FIELD,
  params: FIELD,
  body: FIELD
}

const output = FIELD // Siempre será body
```
Las propiedades `input.query`, `input.headers` y `input.params` son objetos simples (sin niveles).
Las propiedades `input.body` y `output`, pueden ser un simple objeto o una lista de objetos:
``` js
const output = { // Objeto
  id: FIELD,
  titulo: FIELD,
  precio: FIELD
}
const output = [{ // Lista de objetos
  id: FIELD,
  titulo: FIELD,
  precio: FIELD
}]
```
las propiedades `input.body` y `output`, pueden incluir objetos anidados (asociaciones de los modelos):
``` js
const output = [{
  id: FIELD,
  titulo: FIELD,
  precio: FIELD,
  autor: {
    id: FIELD,
    nombre: FIELD,
    usuario: {
      id: FIELD,
      username: FIELD,
      password: FIELD,
      roles: [{
        id: FIELD,
        nombre: FIELD
      }]
    }
  }
}]
```

# Instalación

Para instalar sobre un proyecto, ejecutar el siguiente comando:

$ `sudo npm install --save insac-apidoc`

# Ejemplos
## Ejemplo 1. Modelos

Obtiene la información de un modelo Sequelize.

``` js
const { Apidoc } = require('insac-apidoc')

const LIBRO = sequelize.define('libro', {
  id: { type: Sequelize.INTEGER(), comment: 'ID del libro.', primaryKey: true },
  titulo: { type: Sequelize.STRING(), comment: 'Título del libro.', example: 'El gato negro' },
  precio: { type: Sequelize.FLOAT(), comment: 'Precio del libro. [Bs]' }
}, {
  comment: 'Representa a una obra literaria.'
})

const markDown = Apidoc.model(LIBRO)
console.console.log(markdown)
/*

### **libro**

Representa a una obra literaria.

| Atributo           | Tipo de dato                           | Descripción                    |
|--------------------|----------------------------------------|--------------------------------|
| `id` [ PK ]        | `Integer`                              | ID del libro.                  |
| `titulo`           | `String{de 1 a 255 caracteres}`        | Título del libro.              |
| `precio`           | `Float`                                | Precio del libro. [Bs]         |

*/
```

## Ejemplo 2. Rutas
Crea un router para documentar las rutas.

``` js
const { Apidoc } = require('insac-apidoc')

function onCreate (route, apidoc) {
  console.log(apidoc)
  /**
  * @api {post} /libros crearLibro
  * @apiName crearLibro
  * @apiGroup Libro
  * @apiDescription Crea un libro.
  * @apiVersion 1.0.0
  * @apiParam (Input - body) {String{de 1 a 255 caracteres}} [titulo] Título del libro.
  * @apiParam (Input - body) {Float} [precio] Precio del libro. [Bs]
  * @apiParamExample {json} Ejemplo Petición: Todos los campos posibles
  * {
  *   "titulo": "El gato negro",
  *   "precio": 12.99
  * }
  * @apiSuccess (Output - body) {Integer} [id] ID del libro.
  * @apiSuccess (Output - body) {String} [titulo] Título del libro.
  * @apiSuccess (Output - body) {Float} [precio] Precio del libro. [Bs]
  * @apiSuccessExample {json} Respuesta Exitosa: 200 Ok
  * HTTP/1.1 200 Ok
  * {
  *   "id": 1,
  *   "titulo": "El gato negro",
  *   "precio": 12.99
  * }
  */
}
const router = Apidoc.router(onCreate)

router.POST('/libros', {
  description: 'Crea un libro.',
  name: 'crearLibro',
  group: 'Libro',
  input: {
    body: {
      titulo: LIBRO.attributes.titulo,
      precio: LIBRO.attributes.precio
    }
  },
  output: {
    id: LIBRO.attributes.id,
    titulo: LIBRO.attributes.titulo,
    precio: LIBRO.attributes.precio
  },
  controller: (req, res, next) => {
    res.status(200).json({ msg: 'OK' })
  }
})
```
