/* global describe it expect */
const Apidoc    = require('../../lib/class/Apidoc')
const Sequelize = require('sequelize')
const express   = require('express')

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
        id     : { type: Sequelize.INTEGER(), comment: 'ID del libro.', primaryKey: true },
        titulo : { type: Sequelize.STRING(), comment: 'Título del libro.', example: 'El gato negro' },
        precio : { type: Sequelize.FLOAT(), comment: 'Precio del libro. [Bs]' }
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

      function onCreate (route, apidoc) {
        app[route.method](route.path, route.controller)
        expect(apidoc).to.be.an('string')
        console.log(apidoc)
      }
      const router = Apidoc.router(onCreate)

      router.POST('/libros', {
        description : 'Crea un libro.',
        name        : 'crearLibro',
        group       : 'Libro',
        input       : {
          body: {
            titulo : LIBRO.attributes.titulo,
            precio : LIBRO.attributes.precio
          }
        },
        output: {
          id     : LIBRO.attributes.id,
          titulo : LIBRO.attributes.titulo,
          precio : LIBRO.attributes.precio
        },
        controller: (req, res, next) => {
          res.status(200).json({ msg: 'OK' })
        }
      })
    })
  })
})
