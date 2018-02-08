/* global describe it expect */
const _ = require('lodash')
const Apidoc = require('../../lib/class/Apidoc')
const Sequelize = require('sequelize')
const express = require('express')

const PARAMS = {
  dialect: 'postgres',
  lang: 'es',
  logging: false,
  define: {
    underscored: true,
    freezeTableName: true,
    timestamps: false
  },
  operatorsAliases: false
}

describe('\n - Clase: Apidoc\n', () => {
  let sequelize
  describe(` Método: model`, () => {
    it('Ejecución con parámetros', () => {
      sequelize = new Sequelize(null, null, null, PARAMS)
      sequelize.models.libro = sequelize.define('libro', {
        id: { type: Sequelize.INTEGER(), comment: 'ID del libro.', primaryKey: true },
        titulo: { type: Sequelize.STRING(), comment: 'Título del libro.', example: 'El gato negro' },
        precio: { type: Sequelize.FLOAT(), comment: 'Precio del libro. [Bs]' }
      }, {
        comment: 'Representa a una obra literaria.'
      })
      const markdown = Apidoc.model(sequelize.models.libro)
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

      const INPUT = {
        body: {
          titulo: Object.assign(_.clone(sequelize.models.libro.attributes.titulo), { allowNull: false }),
          precio: Object.assign(_.clone(sequelize.models.libro.attributes.precio), { allowNull: false })
        }
      }
      const OUTPUT = {
        id: Object.assign(_.clone(sequelize.models.libro.attributes.id)),
        titulo: Object.assign(_.clone(sequelize.models.libro.attributes.titulo)),
        precio: Object.assign(_.clone(sequelize.models.libro.attributes.precio))
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
    })
  })
})
