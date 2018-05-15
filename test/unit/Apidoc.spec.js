/* global describe it expect */
const Apidoc    = require('../../lib/class/Apidoc')
const Sequelize = require('sequelize')
const express   = require('express')
const { Field, THIS } = require('field-creator')

const PARAMS = {
  dialect : 'postgres',
  lang    : 'es',
  logging : false,
  define  : {
    underscored     : true,
    freezeTableName : true,
    timestamps      : false
  },
  operatorsAliases: false
}

describe('\n - Clase: Apidoc\n', () => {
  let LIBRO
  describe(` Método: model`, () => {
    it('Ejecución con parámetros', () => {
      const sequelize = new Sequelize(null, null, null, PARAMS)
      LIBRO = sequelize.define('libro', {
        id     : Field.ID({ comment: 'ID del libro.' }),
        titulo : Field.STRING({ comment: 'Título del libro.', example: 'El gato negro' }),
        precio : Field.FLOAT({ comment: 'Precio del libro. [Bs]' }),
        estado : Field.ENUM(['ACTIVO', 'INACTIVO'], { comment: 'Estado del registro.' })
      }, {
        comment: 'Representa a una obra literaria.'
      })
      const markdown = Apidoc.model(LIBRO)
      expect(markdown).to.be.an('string')
      console.log(markdown)
    })
  })

  describe(` Método: router`, () => {
    it('Ejecución con parámetros', () => {
      const app = express()

      function onCreate (route) {
        app[route.method](route.path, route.controller)
        expect(route.apidoc).to.be.an('string')
        console.log(route.apidoc)
      }
      const router = Apidoc.router(onCreate)

      router.POST('/libros', {
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
    })
  })
})
