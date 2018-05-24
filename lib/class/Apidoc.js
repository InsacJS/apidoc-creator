/** @ignore */ const _ = require('lodash')

/**
* Crea la documentación de un servicio.
*/
class Apidoc {
  /**
  * Devuelve una cadena de texto con formato markdown que contiene
  * información de un modelo Sequelize
  * @param {SequelizeModel} model - Modelo sequelize.
  * @return {String}
  */
  static model (model) {
    let markdown = ''
    markdown += `\n### **${model.name}**\n\n`
    markdown += model.options.comment ? `${model.options.comment}\n\n` : ''
    markdown += `| Atributo           | Tipo de dato                           | Descripción                    |\n`
    markdown += `|--------------------|----------------------------------------|--------------------------------|\n`
    for (let prop in model.attributes) {
      const field       = model.attributes[prop]
      const name        = prop
      const pk          = (field.primaryKey) ? '[ PK ]' : ''
      const fk          = (field.references) ? '[ FK ]' : ''
      const attribute   = _.padEnd(`\`${name}\` ${pk}${fk}`, 18, ' ')
      const type        = _.padEnd(`\`${_apidocType(field, false)}\``, 38, ' ')
      const description = _.padEnd(_createDescription(field, prop), 30, ' ')
      markdown += `| ${attribute} | ${type} | ${description} |\n`
    }
    return markdown
  }

  /**
  * Devuelve un objeto que permite crear la documentación de una ruta, con la
  * opción de ejecutar una función cuando la crea.
  * @param {Function} [onCreate] - Función que se ejecuta cuando se crea una ruta.
  *                                Esta función tiene 2 argumentos:
  *                                 - route: que contiene información de la ruta.
  *                                 - apidoc: que contiene una cadena de texto
  *                                   con la documentación.
  * @return {Object}
  */
  static router (onCreate) {
    return {
      GET    : (path, properties) => { properties.method = 'get';    properties.path = path; _route(properties, onCreate) },
      POST   : (path, properties) => { properties.method = 'post';   properties.path = path; _route(properties, onCreate) },
      PUT    : (path, properties) => { properties.method = 'put';    properties.path = path; _route(properties, onCreate) },
      DELETE : (path, properties) => { properties.method = 'delete'; properties.path = path; _route(properties, onCreate) }
    }
  }
}

/**
* Crea el apidoc para una ruta.
* @param {!Object}  properties - Propiedades de la ruta.
* @param {Function} [onCreate] - Función que se ejecuta cuando se encuentra una ruta.
*/
function _route (properties, onCreate) {
  properties.method      = properties.method.toLowerCase()
  properties.name        = properties.name        || `[${properties.method}] ${properties.path}`
  properties.group       = properties.group       || 'API'
  properties.description = properties.description || properties.name
  properties.version     = properties.version     || 1
  const INPUT = {
    headers : properties.input ? properties.input.headers || {} : {},
    params  : properties.input ? properties.input.params  || {} : {},
    query   : properties.input ? properties.input.query   || {} : {},
    body    : properties.input ? properties.input.body    || {} : {}
  }
  const OUTPUT = properties.output || {}
  properties.input  = INPUT
  properties.output = OUTPUT

  let apidoc = ''
  apidoc += _header(properties)

  apidoc += _createApidoc('', INPUT.headers, '@apiHeader', 'Input - headers')
  apidoc += _createApidoc('', INPUT.params,  '@apiParam',  'Input - params')
  apidoc += _createApidoc('', INPUT.query,   '@apiParam',  'Input - query')
  apidoc += _createApidoc('', INPUT.body,    '@apiParam',  'Input - body')

  if (INPUT.body && ((Object.keys(INPUT.body).length > 0) || (Array.isArray(INPUT.body)))) {
    const example = _example(INPUT.body)
    apidoc += `* @apiParamExample {json} Ejemplo Petición \n${example}`
  }
  if (properties.inputExamples) {
    properties.inputExamples.forEach(inputExample => {
      const example = _customExample(inputExample.data)
      apidoc += `* @apiParamExample {json} ${inputExample.title} \n${example}`
    })
  }
  apidoc += _createApidoc('', OUTPUT, '@apiSuccess', 'Output - body')
  if (OUTPUT && ((Object.keys(OUTPUT).length > 0) || (Array.isArray(OUTPUT)))) {
    const example = _example(OUTPUT)
    const code    = '200 Ok'
    const res     = `* HTTP/1.1 ${code}`
    apidoc += `* @apiSuccessExample {json} Respuesta Exitosa: ${code}\n${res}\n${example}`
  }
  if (properties.outputExamples) {
    properties.outputExamples.forEach(outputExample => {
      const example = _customExample(outputExample.data)
      apidoc += `* @apiSuccessExample {json} ${outputExample.title} \n${example}`
    })
  }
  apidoc += `*/\n`
  properties.apidoc = apidoc
  if (onCreate) { onCreate(properties, apidoc) }
}

/**
* Crea un ejemplo para el apidoc.
* @param {Object} obj - Objeto que contiene los campos.
* @return {String}
*/
function _example (obj) {
  let result = ''
  const example = JSON.stringify(_createData(obj, false), null, 2)
  example.split('\n').forEach(line => {
    result += `* ${line}\n`
  })
  return result
}

/**
* Crea un ejemplo personalizado para el apidoc.
* @param {Object} obj - Objeto de ejemplo.
* @return {String}
*/
function _customExample (obj) {
  let result = ''
  const example = JSON.stringify(obj, null, 2)
  example.split('\n').forEach(line => {
    result += `* ${line}\n`
  })
  return result
}

/**
* Crea el encabezado del apidoc.
* @param {Object} route - Propiedades de la ruta.
* @return {String}
*/
function _header (route) {
  let content = '\n/**\n'
  content += `* @api {${route.method}} ${route.path} ${route.name}\n`
  content += `* @apiName ${route.name}\n`
  content += `* @apiGroup ${route.group}\n`
  content += `* @apiDescription ${route.description}\n`
  content += `* @apiVersion ${route.version}.0.0\n`
  let define = ``
  if (route.permissions) {
    route.permissions.forEach(permission => {
      define += `\n/**\n`
      define += `* @apiDefine ${permission} Rol: ${permission.toUpperCase()}\n`
      define += `* Solo los usuarios que tengan este rol pueden acceder al recurso.\n`
      define += `*/\n`
      content += `* @apiPermission ${permission}\n`
    })
  }
  return define + content
}

/**
* Crea los campos del apidoc
* @param {String} fullprop       - Ruta completa del campo.
* @param {Object} obj            - Objeto que contiene los campos.
* @param {String} apidocProperty - Tipo de campo a documentar.
* @param {String} type           - Tipo de campo.
* @return {String}
*/
function _createApidoc (fullprop, obj, apidocProperty, type) {
  let apidoc = ''
  if (Array.isArray(obj)) {
    if (fullprop !== '') {
      apidoc += `* ${apidocProperty} (${type}) {Object[]} ${fullprop} Lista de objetos **${fullprop}**\n`
    }
    apidoc += _createApidoc(fullprop, obj[0], apidocProperty, type)
    return apidoc
  } else {
    if (fullprop !== '') {
      apidoc += `* ${apidocProperty} (${type}) {Object} ${fullprop} Datos del objeto **${fullprop}**\n`
    }
    for (let prop in obj) {
      const field    = obj[prop]
      const property = (fullprop !== '') ? `${fullprop}.${prop}` : prop
      if (_isField(field)) {
        const ONLY_TYPE           = apidocProperty === '@apiSuccess'
        const description         = _createDescription(field, prop)
        const validateDescription = _createValidateDescription(field, ONLY_TYPE)
        let fieldName = ONLY_TYPE ? `[${property}]` : _apidocProp(field, property)
        let fieldType = _apidocType(field, true) // es true, porque siempre se mostrará solamente el tipo de dato.
        apidoc += `* ${apidocProperty} (${type}) {${fieldType}} ${fieldName} ${description} ${validateDescription}\n`
      } else {
        if (typeof field === 'object') {
          apidoc += _createApidoc(property, obj[prop], apidocProperty, type)
        }
      }
    }
  }
  return apidoc
}

/**
* Devuelve la descripción de un campo.
* @param {Object} field      - Atributo.
* @param {String} fieldName  - Nombre del campo.
* @return {String}
*/
function _createDescription (field, fieldName) {
  if (field.comment)   { return field.comment }
  if (field.xlabel)    { return field.xlabel }
  return _.upperFirst(_.replace(fieldName, /_/g, ' ').trim())
}

/**
* Devuelve la descripción del validador de un campo, en formato HTML.
* @param {Object} field      - Atributo.
* @param {boolean} onlyType  - Indica si solo se devolverá el tipo o se
*                              incluirán algunos detalles más específicos.
* @return {String}
*/
function _createValidateDescription (field, onlyType) {
  _normalizeValidate(field)
  if (!onlyType && field.validate && Object.keys(field.validate).length > 0) {
    let vals = ''
    Object.keys(field.validate).forEach(key => {
      let value = field.validate[key].args
      if (typeof value === 'undefined') { value = 'true' }
      vals += `, <strong>${key}: </strong><code>${value}</code>`
    })
    return `<br>${vals.substr(2)}`
  }
  return ''
}

/**
* Devuelve el formato del nombre del campo, según si es requerido o no.
* @param {Object} field - Atributo
* @param {String} prop  - Nombre completo del campo.
* @return {String}
*/
function _apidocProp (field, prop) {
  prop = (typeof field.defaultValue !== 'undefined') ? `${prop}=${field.defaultValue}` : prop
  return (field.allowNull === false) ? prop : `[${prop}]`
}

/**
* Devuelve el formato tipo del campo, según el tipo de dato.
* @param {Object}  field    - Atributo
* @param {boolean} onlyType - Indica si solo se devolverá el tipo o se
*                             incluirán algunos detalles más específicos.
* @return {String}
*/
function _apidocType (field, onlyType) {
  const IS_ARRAY = field.type.key === 'ARRAY'
  const TYPE     = IS_ARRAY ? field.type.type : field.type
  const TYPE_STR = `${_.upperFirst(_.lowerCase(TYPE.key))}${IS_ARRAY ? '[]'  : ''}`
  if (!onlyType) {
    if (TYPE.key === 'ENUM' && typeof TYPE.values !== 'undefined') {
      return `${TYPE_STR}=${TYPE.values.toString()}`
    }
  }
  return TYPE_STR
}

/**
* Normaliza la propiedad validate.
* @param {Object} field Atributo de un modelo sequelize.
*/
function _normalizeValidate (field) {
  if (field.validate) {
    Object.keys(field.validate).forEach(key => {
      const args = field.validate[key]
      if (typeof args === 'function') { return }
      if ((typeof args !== 'object') || (typeof args.args === 'undefined')) {
        field.validate[key] = { args }
      }
    })
  }
}

/**
* Crea un objeto para representar un ejemplo de la ruta.
* @param {Object}  obj          - Objeto con todos los campos.
* @param {boolean} onlyRequired - Indica si se incluirán solo los atributos requeridos o todos.
* @return {Object}
*/
function _createData (obj, onlyRequired) {
  if (Array.isArray(obj)) {
    return [_createData(obj[0], onlyRequired)]
  }
  const data = {}
  for (let prop in obj) {
    const field = obj[prop]
    if (_isField(field)) {
      if (onlyRequired === true) {
        if (field.required) {
          data[prop] = _exampleData(field)
        }
      } else {
        data[prop] = _exampleData(field)
      }
    } else {
      if (typeof field === 'object') {
        data[prop] = _createData(obj[prop], onlyRequired)
      }
    }
  }
  return data
}

/**
* Función que indica si un objeto es un campo o no.
* @param {Object} obj - Objeto.
* @return {String}
*/
function _isField (obj) {
  if (obj && obj._modelAttribute && (obj._modelAttribute === true)) {
    return true
  }
  return false
}

/**
* Devuelve un dato de ejemplo.
* @param {Object} field - Atributo.
* @return {String|Boolean|Number|Object}
*/
function _exampleData (field) {
  if (field.example)      { return field.example }
  if (field.defaultValue) { return field.defaultValue }
  if (field.type.key === 'STRING')  { return 'text' }
  if (field.type.key === 'TEXT')    { return 'text block' }
  if (field.type.key === 'INTEGER') { return 1 }
  if (field.type.key === 'FLOAT')   { return 12.99 }
  if (field.type.key === 'BOOLEAN') { return false }
  if (field.type.key === 'ENUM')    { return field.type.values[0] }
  if (field.type.key === 'JSON')    { return { json: { data: 'value' } } }
  if (field.type.key === 'JSONB')   { return { jsonb: { data: 'value' } } }
  if (field.type.key === 'DATE')    { return '2018-02-03T00:39:45.113Z' }
  if (field.type.key === 'ARRAY') {
    if (field.type.type.key === 'STRING')  { return ['Alfa', 'Beta'] }
    if (field.type.type.key === 'TEXT')    { return ['Text Block A', 'Text Block B'] }
    if (field.type.type.key === 'INTEGER') { return [1, 2] }
    if (field.type.type.key === 'FLOAT')   { return [1.2, 2.8] }
    if (field.type.type.key === 'BOOLEAN') { return [true, false] }
    if (field.type.type.key === 'DATE')    { return ['2018-02-03T00:39:45.113Z'] }
    return ['example']
  }
  return 'example'
}

module.exports = Apidoc
