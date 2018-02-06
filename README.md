# Insac Apidoc
Crea el apidoc de las rutas de un servicio web según el formato que establece ApidocJS.

# Características
- Utiliza objetos con atributos Sequelize para indicar los datos de entrada (INPUT) y los datos de salida (OUTPUT).
- Crear la documentación de los modelos de la base de datos en formato MD (MarkDown).

# Ejemplo 1. Modelos
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

// ### **libro**
// Representa a una obra literaria.
//
// | Atributo      | Tipo de dato                    | Descripción            |
// |---------------|---------------------------------|------------------------|
// | `id` [ PK ]   | `Integer`                       | ID del libro.          |
// | `titulo`      | `String{de 1 a 255 caracteres}` | Título del libro.      |
// | `precio`      | `Float`                         | Precio del libro. [Bs] |
```

# Ejemplo 2. Rutas
``` js
const { Apidoc } = require('insac-apidoc')
const { Field } = require('insac-field')
const express = require('express')

const app = expres()

function onCreate (route, apidoc) {
  app[route.method](route.path, route.controller)

  // apidoc es una cadena de texto que contiene la documentación:

  // /**
  // * @api {post} /libros crearLibro
  // * @apiName crearLibro
  // * @apiGroup Libro
  // * @apiDescription Crea un libro.
  // * @apiVersion 1.0.0
  // * @apiParam (Input - body) {String{de 1 a 255 caracteres}} titulo Título del libro.
  // * @apiParam (Input - body) {Float} precio Precio del libro. [Bs]
  // * @apiParamExample {json} Ejemplo Petición: Todos los campos posibles
  // * {
  // *   "titulo": "El gato negro",
  // *   "precio": 1.00
  // * }
  // * @apiSuccess (Output - body) {Integer} [id] ID del libro.
  // * @apiSuccess (Output - body) {String} [titulo] Título del libro.
  // * @apiSuccess (Output - body) {String} [precio] Precio del libro. [Bs]
  // * @apiSuccessExample {json} Respuesta Exitosa: 200 Ok
  // * HTTP/1.1 200 Ok
  // * {
  // *   "id": 1,
  // *   "titulo": "El gato negro",
  // *   "precio": 1.00
  // * }
  // */
}
const router = Apidoc.router(onCreate)

const INPUT = {
  body: {
    titulo: Field.CLONE(LIBRO.attributes.titulo, { allowNull: false }),
    precio: Field.CLONE(LIBRO.attributes.precio, { allowNull: false })
  }
}
const OUTPUT = {
  id: LIBRO.attributes.id
  titulo: LIBRO.attributes.titulo,
  precio: LIBRO.attributes.precio
}}
function controller (req, res, next) {
  LIBRO.create(req.body).then(result => {
    res.status(200).json(result)
  })
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
