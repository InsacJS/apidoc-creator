# Instalación

Para instalar sobre un proyecto, ejecutar el siguiente comando:

$ `sudo npm install --save insac-apidoc`

# Modo de uso

``` js
const { Apidoc } = require('insac-apidoc')

const markdown = Apidoc.model(MODEL)

function onCreate(route, apidoc) {
  console.log(apidoc)
}
const router = Apidoc.router(onCreate)

router.GET('/api/v1/libros', {
  description: 'Obtiene una lista de libros.'
})
```
