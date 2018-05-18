# Apidoc Creator

La forma tradicional de documentar servicios web RESTFUL, es escribir la descripción de la ruta en forma de comentario en el caso de ApidocJS o en un fichero con formato JSON en el caso de Swagger.

ApidocJS es muy flexible al momento de describir la ruta de un servicio, sin embargo, describir las rutas en forma de comentarios no es la adecuada si se quiere automatizar este proceso.

Apidoc Creator utiliza ApidocJS para crear la documentación y ofrece un sistema diferente para describir las rutas, fácil de implementar. Para describir los datos de entrada y salida, utiliza la librería Field Creator.

## Características

- Devuelve la descripción de una ruta en formato de texto plano, según el formato que establece ApidocJS.
- Devuelve la descripción de un modelo Sequelize en formato MD (MarkDown).

## Propiedades soportadas:

| Propiedad        | Descripción                                              |
|------------------|----------------------------------------------------------|
| `name`           | Nombre asignado a la ruta.                               |
| `method`         | Método HTTP para acceder al recurso.                     |
| `path`           | Ruta del recurso (URI).                                  |
| `group`          | Grupo al que pertenece la ruta.                          |
| `version`        | Versión de la ruta.                                      |
| `description`    | Descripción de la ruta.                                  |
| `input`          | Datos de entrada. Objeto de tipo **FieldGroup**.         |
| `output`         | Datos de salida. Objeto de tipo **FieldGroup**.          |
| `inputExamples`  | Ejemplos de datos de entrada.                            |
| `outputExamples` | Ejemplos de datos de salida.                             |
| `permissions`    | Lista de todos los roles que pueden acceder al recurso.  |

## Propiedades `input` y `output`

```js
const INPUT = {
  headers : FIELD,
  params  : FIELD,
  query   : FIELD,
  body    : FIELD
}

const OUTPUT = FIELD // Siempre sera body
```

Para crear los objetos `input` y `output`, se recomienda utilizar la librería [field-creator](https://github.com/insacjs/field-creator).

## Función `onCreate`

Esta función puede utilizarse para realizar una tarea de forma automática cada vez que se defina una ruta.

```js
function onCreate (route) {
  console.log(route.apidoc)
  // TODO
}

const router = Apidoc.router(onCreate)

router.GET('/api/v1/libros', { ... })
router.GET('/api/v1/libros/:id', { ... })
router.POST('/api/v1/libros', { ... })
router.PUT('/api/v1/libros/:id', { ... })
router.DELETE('/api/v1/libros/:id', { ... })
```

## Instalación

Para instalar sobre un proyecto, ejecutar el siguiente comando:

$ `npm install --save apidoc-creator`

## Ejemplo 1. Descripción de modelos

``` js
const { Apidoc } = require('apidoc-creator')
const { Field }  = require('field-creator')

LIBRO = sequelize.define('libro', {
  id     : Field.ID({ comment: 'ID del libro.' }),
  titulo : Field.STRING({ comment: 'Título del libro.', example: 'El gato negro' }),
  precio : Field.FLOAT({ comment: 'Precio del libro. [Bs]' }),
  estado : Field.ENUM(['ACTIVO', 'INACTIVO'], { comment: 'Estado del registro.' })
}, {
  comment: 'Representa a una obra literaria.'
})
const markdown = Apidoc.model(LIBRO)
console.log(markdown)
/*

### **libro**

Representa a una obra literaria.

| Atributo           | Tipo de dato                           | Descripción                    |
|--------------------|----------------------------------------|--------------------------------|
| `id` [ PK ]        | `Integer`                              | ID del libro.                  |
| `titulo`           | `String{de 1 a 255 caracteres}`        | Título del libro.              |
| `precio`           | `Float`                                | Precio del libro. [Bs]         |
| `estado`           | `String=ACTIVO,INACTIVO`               | Estado del registro.           |

*/
```

## Ejemplo 2. Descripción de rutas.

``` js
const { Apidoc }      = require('apidoc-creator')
const { Field, THIS } = require('field-creator')
const express = require('express')

const app = express()

function onCreate (route) {
  app[route.method](route.path, route.controller)

  console.log(route.apidoc)
  /**
  * @api {post} /libros crearLibro
  * @apiName crearLibro
  * @apiGroup Libro
  * @apiDescription Crea un libro.
  * @apiVersion 1.0.0
  * @apiParam (Input - body) {String{de 1 a 255 caracteres}} titulo Título del libro.
  * @apiParam (Input - body) {Float} precio Precio del libro. [Bs]
  * @apiParam (Input - body) {String=ACTIVO,INACTIVO} estado Estado del registro.
  * @apiParamExample {json} Ejemplo Petición
  * {
  *   "titulo": "El gato negro",
  *   "precio": 12.99,
  *   "estado": "ACTIVO"
  * }
  * @apiSuccess (Output - body) {Integer} [id] ID del libro.
  * @apiSuccess (Output - body) {String} [titulo] Título del libro.
  * @apiSuccess (Output - body) {Float} [precio] Precio del libro. [Bs]
  * @apiSuccess (Output - body) {String} [estado] Estado del registro.
  * @apiSuccessExample {json} Respuesta Exitosa: 200 Ok
  * HTTP/1.1 200 Ok
  * {
  *   "id": 1,
  *   "titulo": "El gato negro",
  *   "precio": 12.99,
  *   "estado": "ACTIVO"
  * }
  */
}
const router = Apidoc.router(onCreate)

router.GET('/libros', {
  description : 'Crea un libro.',
  name        : 'crearLibro',
  group       : 'Libro',
  input       : {
    body: Field.group(LIBRO, {
      titulo : THIS({ allowNull: false }),
      precio : THIS({ allowNull: false }),
      estado : THIS({ allowNull: false })
    })
  },
  output: Field.group(LIBRO, {
    id     : THIS(),
    titulo : THIS(),
    precio : THIS(),
    estado : THIS()
  }),
  controller: (req, res, next) => {
    return res.status(200).json({ msg: 'ok' })
  }
})
```
