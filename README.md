# Insac Apidoc

Crea el apidoc de las rutas de un servicio web según el formato que establece ApidocJS.

# Características

- Utiliza objetos con atributos Sequelize para indicar los datos de entrada (INPUT) y los datos de salida (OUTPUT).
- Crear la documentación de los modelos de la base de datos en formato MD (MarkDown).

# Instalación

Para instalar sobre un proyecto, ejecutar el siguiente comando:

$ `sudo npm install --save insac-field`

# Ejemplos
## Ejemplo 1. Modelos

Obtiene la información de un modelo Sequelize.

``` js
const { Apidoc } = require('insac-apidoc')
const { Field } = require('insac-field')

const LIBRO = sequelize.define('libro', {
  id: Field.ID({ comment: 'ID del libro.' }),
  titulo: Field.STRING({ comment: 'Título del libro.' }),
  precio: Field.FLOAT({ comment: 'Precio del libro. [Bs]' })
}, {
  comment: 'Representa a una obra literaria.'
})

const markDown = Apidoc.model(LIBRO)
// markDown es una cadena de texto que contiene la documentación

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
const { Field, FieldContainer } = require('insac-field')
const express = require('express')

const container = new FieldContainer()
container.define('libro', {
  id: Field.ID({ comment: 'ID del libro.' }),
  titulo: Field.STRING({ comment: 'Título del libro.', example: 'El gato negro' }),
  precio: Field.FLOAT({ comment: 'Precio del libro. [Bs]' })
}, {
  comment: 'Representa a una obra literaria.'
})

const app = express()

function onCreate (route, apidoc) {
  app[route.method](route.path, route.controller)
  // apidoc es una cadena de texto que contiene la documentación

  /**
  * @api {post} /libros crearLibro
  * @apiName crearLibro
  * @apiGroup Libro
  * @apiDescription Crea un libro.
  * @apiVersion 1.0.0
  * @apiParam (Input - body) {String{de 1 a 255 caracteres}} titulo Título del libro.
  * @apiParam (Input - body) {Float} precio Precio del libro. [Bs]
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

const INPUT = {
  body: {
    titulo: container.models.libro('titulo', { allowNull: false }),
    precio: container.models.libro('precio', { allowNull: false })
  }
}
const OUTPUT = {
  id: container.models.libro('id'),
  titulo: container.models.libro('titulo'),
  precio: container.models.libro('precio')
}
function controller (req, res, next) {
  res.status(200).json({ msg: 'OK' })
}
router.POST('/libros', {
  description: 'Crea un libro.',
  name: 'crearLibro',
  group: 'Libro',
  input: INPUT,
  output: OUTPUT,
  controller
})
```
