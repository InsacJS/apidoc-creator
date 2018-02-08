/* global describe it expect */
const Apidoc = require('../../lib/class/Apidoc')
const Sequelize = require('sequelize')
const express = require('express')
const { Field, FieldContainer } = require('insac-field')

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
  describe(` Método: model`, () => {
    it('Ejecución con parámetros', () => {
      const sequelize = new Sequelize(null, null, null, PARAMS)
      const LIBRO = sequelize.define('libro', {
        id: Field.ID({ comment: 'ID del libro.' }),
        titulo: Field.STRING({ comment: 'Título del libro.' }),
        precio: Field.FLOAT({ comment: 'Precio del libro. [Bs]' })
      }, {
        comment: 'Representa a una obra literaria.'
      })
      const markdown = Apidoc.model(LIBRO)
      expect(markdown).to.be.an('string')
    })
  })

  describe(` Método: router`, () => {
    it('Ejecución con parámetros', () => {
      const container = new FieldContainer()
      container.define('libro', {
        id: Field.ID({ comment: 'ID del libro.' }),
        titulo: Field.STRING({ comment: 'Título del libro.' }),
        precio: Field.FLOAT({ comment: 'Precio del libro. [Bs]' })
      }, {
        comment: 'Representa a una obra literaria.'
      })

      const app = express()

      function onCreate (route, apidoc) {
        app[route.method](route.path, route.controller)
        expect(apidoc).to.be.an('string')
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
    })
  })
})
