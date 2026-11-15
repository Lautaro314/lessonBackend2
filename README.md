# ShipNow API - Refactorización por Capas (Pre-entrega Módulo 1)

API REST refactorizada de una estructura monolítica a una arquitectura profesional en 3 capas (**Controller - Service - Repository**) con validación de entorno y centralización de constantes.

## 🏗️ Arquitectura del Proyecto

- **Controllers (`src/controllers/`)**: Única puerta de entrada HTTP. Gestionan la solicitud (`req`), llaman al servicio correspondiente y envían la respuesta (`res`).
- **Services (`src/services/`)**: Contienen la lógica de negocio y reglas del dominio (como el cálculo automático de estado según stock o validación de emails duplicados).
- **Repositories (`src/repositories/`)**: Única capa que interactúa directamente con Mongoose. Encapsula filtros por defecto (borrado lógico `isDeleted: false`) y consultas a la base de datos.
- **Config (`src/config/`)**: Módulo de inicialización que valida las variables de entorno obligatorias (`PORT`, `MONGODB_URI`, `NODE_ENV`) al arrancar el servidor.
- **Constants (`src/constants/`)**: Objetos inmutables (`Object.freeze`) para evitar "strings mágicos" en roles y estados de productos.

### Justificación de la Separación Service vs. Repository
La separación entre la capa de **Servicio** y de **Repositorio** permite desacoplar la lógica de negocio de la tecnología de persistencia. El **Repository** se limita a buscar y guardar datos encapsulando detalles de Mongoose, mientras que el **Service** toma las decisiones del negocio sin importar el ORM/ODM utilizado.

## 🧪 Módulo de Mocking y Carga de Datos (`/api/mocks`)

Módulo desarrollado para la generación de datos simulados mediante `@faker-js/faker`, estructurado bajo la arquitectura por capas (**Controller-Service-Factory**).

### Endpoints disponibles:

- **`GET /api/v1/mocks/users?qty=N`**: Devuelve `N` usuarios simulados (estructura `{ status, payload }`) sin persistir en la base de datos.
- **`GET /api/v1/mocks/orders?qty=N`**: Devuelve `N` pedidos simulados con productos, totales, estados y prioridades tomados de las constantes.
- **`POST /api/v1/mocks/seed?qty=N`**: Inserta masivamente en MongoDB `N` registros de prueba relacionando usuarios, pedidos y repartidores.

- ## ⚠️ Manejo Profesional de Errores (Módulo 3)

La API cuenta con una capa centralizada de gestión de excepciones compuesta por:
- **Diccionario de errores (`error.enums.js`)**: Define códigos HTTP y mensajes estandarizados.
- **Clase de Error Personalizado (`CustomError`)**: Permite propagar errores controlados desde la capa de servicios.
- **Middleware Global (`error.middleware.js`)**: Intercepta los errores y retorna una estructura JSON uniforme (`status` y `error`).

### Estructura de Respuesta de Error:
```json
{
  "status": "fail",
  "error": "Mensaje descriptivo del error"
}
```

## 🧪 Testing (Pre-entrega Módulo 6)

Suite de **tests funcionales** que validan los endpoints principales de ShipNow, cubriendo casos exitosos y errores esperados (status HTTP + estructura del body + formato de error del módulo de errores).

### Herramientas

| Herramienta | Rol |
| --- | --- |
| **Mocha** | Organiza y ejecuta los tests |
| **Chai** | Asserts (`expect`) sobre status, body y propiedades |
| **Supertest** | Peticiones HTTP contra la app Express sin abrir un puerto |
| **mongodb-memory-server** | Base de datos de testing aislada, en memoria y descartable |

### Cómo ejecutar los tests

```bash
npm install
npm test          # corre la suite completa desde cero
npm run test:watch
```

`npm test` levanta una base MongoDB **en memoria** de forma automática, ejecuta los tests y la destruye al finalizar. **No hace falta** tener una base de datos levantada ni datos cargados a mano, y **no toca** la base de desarrollo.

### Base de datos de testing

Se usa una base de datos **separada y en memoria** (`mongodb-memory-server`), por lo que no se requiere ninguna instancia externa ni credenciales reales. La estrategia de limpieza borra las colecciones antes de cada grupo de tests y elimina la base completa al terminar, garantizando que la suite pase corridas consecutivas sin intervención manual.

### Variables de entorno

El entorno de testing está separado del de desarrollo mediante el archivo **`.env.test`** (versionado, sin secretos reales). Variables necesarias:

```env
PORT=8080
NODE_ENV=test
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow_test
SECRET=test_secret
JWT_SECRET=test_jwt_secret
GOOGLE_CLIENT_ID=test_google_client_id
GOOGLE_CLIENT_SECRET=test_google_client_secret
GOOGLE_CALLBACK=http://localhost:8080/api/v1/auth/google/callback
```

`env.config.js` carga `.env.test` cuando `NODE_ENV=test` y `.env` en el resto de los casos. `test/hooks.js` fija estas variables antes de importar la app.

### Separación app / servidor

`src/app.js` exporta la app de Express **sin** levantarla ni conectar a la base. El arranque del servidor vive en `src/server.js` (`npm start`). Gracias a esto, los tests importan la app directamente con Supertest, sin abrir un puerto manualmente.

### Módulos / endpoints cubiertos

Los tests viven en la carpeta `test/`, agrupados por recurso:

| Archivo | Endpoints | Casos exitosos | Casos de error |
| --- | --- | --- | --- |
| `test/users.test.js` | `GET /api/v1/users`, `GET /api/v1/users/:id`, `POST /api/v1/users` | listado, consulta por ID, creación | 404 usuario inexistente, 400 datos faltantes, 400 email duplicado |
| `test/orders.test.js` | `GET /api/v1/orders`, `POST /api/v1/orders`, `GET /api/v1/orders/:id`, `PUT /api/v1/orders/:id` | listado, creación con total calculado, consulta por ID, actualización de estado | 404 pedido inexistente, 400 sin items, 400 estado inválido |
| `test/mocks.test.js` | `GET /api/v1/mocks/users`, `GET /api/v1/mocks/orders`, `POST /api/v1/mocks/seed` | generación de usuarios/pedidos, seeding relacionado | 400 cantidades inválidas |
| `test/logger.test.js` | `GET /api/v1/test/loggerTest` | genera logs en todos los niveles | — |
| `test/swagger.test.js` | `GET /api/v1/docs` | sirve la documentación + valida la spec OpenAPI | — |
| `test/notfound.test.js` | cualquier ruta inexistente | — | 404 con formato de error |

Cada test valida status HTTP **y** la estructura del body (por ejemplo `{ status: "success", payload: [...] }` o `{ status: "fail", error: "..." }`). Los comportamientos documentados en Swagger (p. ej. el `404` ante un recurso inexistente o el `400` ante `qty` inválido) tienen su test correspondiente.

### Datos de prueba y limpieza

- Los datos se generan de forma controlada y repetible (`test/helpers.js` crea usuarios/pedidos descartables y `@faker-js/faker` para los mocks). No se usan datos reales.
- `test/hooks.js` limpia la base antes de cada grupo (`beforeEach`) y la destruye en `afterAll`.
- Un usuario válido se crea antes de cada test de pedidos, evitando depender de datos precargados o del orden de ejecución.
