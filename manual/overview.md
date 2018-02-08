# Características

- Utiliza objetos con atributos Sequelize para indicar los datos de entrada (INPUT) y los datos de salida (OUTPUT).
- Crear la documentación de los modelos de la base de datos en formato MD (MarkDown).

# Formato de salida

### **libro**

Representa a una obra literaria.

| Atributo           | Tipo de dato                           | Descripción                    |
|--------------------|----------------------------------------|--------------------------------|
| `id` [ PK ]        | `Integer`                              | ID del libro.                  |
| `titulo`           | `String{de 1 a 255 caracteres}`        | Título del libro.              |
| `precio`           | `Float`                                | Precio del libro. [Bs]         |
