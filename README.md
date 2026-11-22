# ShipNow API - Arquitectura por Capas, Performance y Docker (Pre-entrega Módulo 8)

API REST refactorizada de una estructura monolítica a una arquitectura profesional en 3 capas (**Controller - Service - Repository**) con validación de entorno y centralización de constantes.

## 🏗️ Arquitectura del Proyecto

- **Controllers (`src/controllers/`)**: Única puerta de entrada HTTP. Gestionan la solicitud (`req`), llaman al servicio correspondiente y envían la respuesta (`res`).
- **Services (`src/services/`)**: Contienen la lógica de negocio y reglas del dominio (como el cálculo automático de estado según stock o validación de emails duplicados).
- **Repositories (`src/repositories/`)**: Única capa que interactúa directamente con Mongoose. Encapsula filtros por defecto (borrado lógico `isDeleted: false`) y consultas a la base de datos.
- **Config (`src/config/`)**: Módulo de inicialización que valida las variables de entorno obligatorias al arrancar (ver sección Producción/Docker) y falla con un mensaje claro si falta alguna.
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

## 📎 Carga de Archivos, Documentos y Comprobantes (Pre-entrega Módulo 7)

Carga de archivos con **Multer** integrada a la arquitectura por capas, el sistema de errores, el logger, Swagger y los tests funcionales.

### Configuración centralizada de Multer (`src/config/multer.config.js`)

- **Almacenamiento**: `diskStorage` en una carpeta temporal del sistema por defecto (nunca dentro del repo), configurable con `UPLOADS_DIR`. En contenedores se monta un volumen en `/var/lib/shipnow/uploads`.
- **Subcarpetas por tipo**: `users` (documentos de usuario), `licenses` (licencias) y `receipts` (comprobantes de pedidos), dentro de la raíz indicada.
- **Nombrado**: nombre único generado (`timestamp + random`) preservando la extensión original; el nombre original se guarda solo como metadato.
- **Tipos permitidos**: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- **Tamaño máximo**: 5 MB por archivo.
- **Errores de Multer normalizados** al formato del proyecto (`LIMIT_FILE_SIZE` → tamaño máximo, `LIMIT_UNEXPECTED_FILE` → campo inesperado, tipo inválido → error propio).
- **Limpieza**: si la asociación con la entidad falla luego de guardar el archivo, el archivo se elimina del disco para no dejar huérfanos.

La carpeta de uploads está en `.gitignore` y en `.dockerignore`: al repositorio **nunca** se suben los archivos cargados. Se crea de forma asíncrona por request (sin bloquear el Event Loop) y los archivos se consideran temporales: la persistencia real son los metadatos en MongoDB. Para almacenamiento definitivo se debe migrar a un servicio de objetos (S3, GCS, etc.) con política de retención.

### Endpoints

| Método | Endpoint | Campo multipart | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/v1/users/:id/documents` | `document` + `document_type` | Sube un documento de usuario, valida que el usuario y el tipo existan, lo guarda en `users/` o `licenses/` y registra los metadatos en el usuario. |
| `POST` | `/api/v1/orders/:id/receipts` | `receipt` | Sube un comprobante, valida que el pedido exista, lo guarda en `receipts/` y registra los metadatos en el pedido. |

Tipos de documento válidos para usuarios: `DNI`, `LICENSE`, `PASSPORT`, `PROOF_OF_ADDRESS`.

### Metadatos persistidos (no el archivo)

En la base se guardan únicamente: `original_name`, `filename` (generado), `path`, `mimetype`, `size`, `document_type` y `uploaded_at`. El esquema reutilizable vive en `src/models/schemas/file-metadata.schema.js` y se embebe como subdocumentos en `User.documents` y `Order.receipts`.

### Errores específicos y logging

Se agregaron errores centralizados en `error.enums.js`: archivo requerido, tipo de archivo inválido, tamaño superado, tipo de documento inválido, campo inesperado, entidad no encontrada y error al guardar. Todos responden con el formato general `{ status, error }`.

El logger registra la carga exitosa, los intentos de tipo no permitido, los comprobantes asociados y los errores (a través del middleware global).

### Swagger

Ambos endpoints están documentados como `multipart/form-data`, indicando el nombre del campo de archivo, los campos adicionales requeridos, los tipos de documento permitidos, la respuesta `201` y los errores `400`/`404`.

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
| `test/swagger.test.js` | `GET /api/v1/docs` | sirve la documentación + valida la spec OpenAPI y los endpoints multipart | — |
| `test/uploads.test.js` | `POST /api/v1/users/:id/documents`, `POST /api/v1/orders/:id/receipts` | carga de documento/comprobante, guardado en disco y metadatos en la base, carpeta `licenses` | 400 archivo faltante, 400 tipo de archivo inválido, 400 tamaño superado, 400 tipo de documento inválido, 400 campo inesperado, 404 usuario/pedido inexistente |
| `test/notfound.test.js` | cualquier ruta inexistente | — | 404 con formato de error |
| `test/health.test.js` | `GET /health` | estado, entorno, uptime y timestamp | — |
| `test/pagination.test.js` | `GET /users`, `GET /orders`, `GET /mocks/users` | paginación, filtros y límites | 400 page/limit/filtro inválido, tope de `qty` |
| `test/deliveries.test.js` | `GET /api/v1/deliveries` | listado paginado y filtros de entregas | 400 objectId inválido |
| `test/internal-endpoints.test.js` | mocks, logger, process, `/info`, `/health`, Swagger | health y Swagger disponibles en producción | 404 en endpoints internos cuando `NODE_ENV=production` |

Cada test valida status HTTP **y** la estructura del body (por ejemplo `{ status: "success", payload: [...] }` o `{ status: "fail", error: "..." }`). Los comportamientos documentados en Swagger (p. ej. el `404` ante un recurso inexistente o el `400` ante `qty` inválido) tienen su test correspondiente.

### Datos de prueba y limpieza

- Los datos se generan de forma controlada y repetible (`test/helpers.js` crea usuarios/pedidos descartables y `@faker-js/faker` para los mocks). No se usan datos reales.
- `test/hooks.js` limpia la base antes de cada grupo (`beforeEach`) y la destruye en `afterAll`.
- Un usuario válido se crea antes de cada test de pedidos, evitando depender de datos precargados o del orden de ejecución.

---

## 🚀 Producción, performance y Docker (Pre-entrega Módulo 8)

Repositorio: **https://github.com/Lautaro314/lessonBackend2.git**

La API queda lista para desplegarse con configuración por entorno, health check, paginación en los listados y una imagen Docker reproducible. Requiere **Node.js 20+** (se usa Node 22 en la imagen).

### Variables de entorno

Copiar `.env.example` a `.env` y completar los valores. **No hay secretos escritos en el código** y la app **no arranca** si falta alguna variable crítica: `env.config.js` falla al inicio con un mensaje que lista las variables ausentes. También valida `PORT` (entero 1-65535), `NODE_ENV` y `LOG_LEVEL`.

| Variable | Obligatoria | Default | Uso |
| --- | --- | --- | --- |
| `PORT` | Sí | — | Puerto HTTP de la API (8080 en ejemplos) |
| `NODE_ENV` | Sí | — | `development`, `test` o `production` |
| `MONGODB_URI` | Sí | — | URI de MongoDB |
| `SECRET` | Sí | — | Firma de sesiones y cookies |
| `JWT_SECRET` | Sí | — | Firma/verificación de JWT |
| `GOOGLE_CLIENT_ID` | Sí | — | OAuth de Google (servicio externo) |
| `GOOGLE_CLIENT_SECRET` | Sí | — | OAuth de Google (servicio externo) |
| `GOOGLE_CALLBACK` | Sí | — | URL de callback externa de Google |
| `LOG_LEVEL` | No | `info` en producción / `debug` en el resto | Nivel de logs de consola (`fatal`, `error`, `warning`, `info`, `http`, `debug`) |
| `PUBLIC_URL` | No | `http://localhost:PORT` | URL pública que muestra Swagger |
| `UPLOADS_DIR` | No | carpeta temporal del sistema | Raíz de archivos subidos; en Docker: `/var/lib/shipnow/uploads` |

Entornos: `.env` (desarrollo), `.env.test` (testing, versionado y sin secretos reales) y variables inyectadas al contenedor para producción. En producción las sesiones se guardan en MongoDB (`connect-mongo`) en vez de memoria, para sobrevivir reinicios.

### Cómo correr la API localmente

```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env
# editar .env con tus valores
npm run dev                 # o npm start
```

- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/api/v1/docs/`
- Health check: `http://localhost:8080/health`

### Cómo correr los tests

```bash
npm test
npm run test:watch
```

Usan `.env.test` y un MongoDB en memoria: no necesitás base externa ni tocar la base de desarrollo.

### Performance aplicada

- **Paginación obligatoria** en listados: `GET /api/v1/users`, `/api/v1/orders`, `/api/v1/deliveries` y `/api/v1/products` aceptan `page` (desde 1) y `limit` (1-100, default 20). La respuesta mantiene `{ status, payload: [...] }` y agrega `pagination: { total, page, limit, totalPages, hasNext, hasPrev }`.
- **Filtros con whitelist**: usuarios (`email`, `role`), pedidos (`user`, `status`, `priority`), entregas (`order`, `delivery_driver`, `status`) y productos (`name`, `status`). No se puede sobrescribir `isDeleted` ni inyectar operadores de MongoDB. Un filtro inválido responde 400.
- **Mocks controlados**: `qty` tiene un máximo de 100 por request en `GET /mocks/users`, `GET /mocks/orders` y `POST /mocks/seed`.
- **Carga de archivos**: 5 MB máximo por archivo, MIME permitidos `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, un archivo por request y límites de campos/partes. Errores normalizados al middleware centralizado, limpieza del archivo si falla la asociación y creación de directorios sin operaciones sincrónicas por request.
- **Logs**: Winston con niveles configurables; en consola se respeta `LOG_LEVEL` y el archivo rotado de errores (`logs/error-%DATE%.log`) se limita a 20 MB con 14 días de retención. No se loguean bodies, secretos ni tokens.

### Criterio sobre endpoints internos en producción

Se aplica una política de **"interno = oculto"** mediante `src/middleware/internal-only.middleware.js`: en `NODE_ENV=production` responden **404 genérico** (como si la ruta no existiera), para no revelar su existencia.

| Endpoint | Desarrollo / Test | Producción | Motivo |
| --- | --- | --- | --- |
| `/api/v1/mocks/*` | Disponible | **Bloqueado (404)** | Genera datos y hace seeding; nunca debe alterar producción |
| `/api/v1/test/loggerTest`, `/api/v1/luces/loggerTest` | Disponible | **Bloqueado (404)** | Genera logs de prueba y ensucia la observabilidad |
| `/api/v1/process/*` | Disponible | **Bloqueado (404)** | Incluye una tarea que bloquea el Event Loop y ejecución de procesos hijos |
| `/info` | Disponible | **Bloqueado (404)** | Expone `pid` y uso de memoria |
| `/api/v1/docs` | Disponible | **Disponible** | Documentación de solo lectura, sin secretos; útil para consumidores de la API |
| `/health` | Disponible | **Disponible** | Necesario para orquestadores y balanceadores; solo estado, entorno, uptime y timestamp |

### Construir y ejecutar con Docker

```bash
# Construir la imagen
docker build -t shipnow-api:1.0.0 .

# Ejecutar inyectando variables desde un archivo externo (no versionado)
docker run --rm --name shipnow-api \
  -p 8080:8080 \
  --env-file .env \
  -v shipnow-uploads:/var/lib/shipnow/uploads \
  shipnow-api:1.0.0
```

- **Puerto de la API**: `8080` (definido por `PORT` en el archivo de entorno y `EXPOSE 8080` en el `Dockerfile`). Si cambiás `PORT`, publicá el mismo valor con `-p`.
- La imagen es multi-stage, instala solo dependencias de producción, ejecuta como usuario `node` (no root) e incluye un `HEALTHCHECK` sobre `/health`.
- Verificación rápida dentro/contra el contenedor:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/docs/
curl "http://localhost:8080/api/v1/users?limit=5"
docker logs -f shipnow-api
```

También se pueden pasar variables individuales con `docker run -e PORT=8080 -e MONGODB_URI=... -e SECRET=... -e JWT_SECRET=... -e GOOGLE_CLIENT_ID=... -e GOOGLE_CLIENT_SECRET=... -e GOOGLE_CALLBACK=...`. En producción conviene `NODE_ENV=production`, `LOG_LEVEL=info` y un `PUBLIC_URL` real.

### Logs, uploads y archivos que no se suben al repo

- **Logs**: se escriben en consola (los recoge `docker logs` / el driver de logs) y los errores también en `logs/` dentro del contenedor; ese directorio es efímero: montar un volumen o enviar logs a un sistema centralizado si se necesitan conservar. Nunca se incluyen secretos en los mensajes.
- **Uploads**: se guardan fuera del repo en `UPLOADS_DIR` y se montan en un volumen (`shipnow-uploads`). No son almacenamiento permanente: para persistencia real usar object storage con política de retención.
- **No subir al repositorio**: `.env`, `.env.local`, `logs/`, `uploads/`, `uploads-test/`, `coverage/`, `node_modules/`, archivos temporales ni secretos. `.gitignore` los excluye de git y `.dockerignore` evita copiarlos a la imagen (tampoco se copian `.git`, tests, ni README).
