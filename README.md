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

- **`GET /api/mocks/mockingusers?qty=N`**: Devuelve `N` usuarios simulados sin persistir en la base de datos.
- **`GET /api/mocks/mockingorders?qty=N`**: Devuelve `N` pedidos simulados con productos, totales, estados y prioridades tomados de las constantes.
- **`POST /api/mocks/generateData?qty=N`**: Inserta masivamente en MongoDB `N` registros de prueba relacionando usuarios y repartidores.

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

## 📊 Sistema de Logging y Monitoreo (Módulo 4)

El proyecto utiliza **Winston** para la gestión centralizada de registros y monitoreo, diferenciando comportamientos entre entornos de desarrollo y producción.

### 📌 Niveles de Log Configurados (De mayor a menor severidad):
1. **`fatal`**: Errores críticos del sistema (ej. fallo grave en la conexión a la base de datos).
2. **`error`**: Excepciones de servidor y fallos inesperados.
3. **`warning`**: Advertencias de negocio, rutas no encontradas o validaciones fallidas.
4. **`info`**: Información general de eventos del sistema (ej. servidor iniciado, conexión exitosa).
5. **`http`**: Peticiones HTTP entrantes.
6. **`debug`**: Información detallada orientada al diagnóstico en desarrollo.

### 🧪 Cómo probar el Endpoint del Logger:
Se incorporó un endpoint de pruebas para disparar registros en todos los niveles de forma simultánea:
- **`GET /api/test/loggerTest`**
  - *Resultado*: Generará salidas en la consola del servidor y almacenará automáticamente los niveles `error` y `fatal` dentro de la carpeta `/logs` con rotación diaria.

### 🗂️ Persistencia y GitIgnore:
- Los registros de errores críticos se almacenan de forma local en la carpeta `/logs/` utilizando `winston-daily-rotate-file`.
- La carpeta `/logs` se encuentra excluida en el archivo `.gitignore` para evitar la subida de archivos temporales de ejecución al repositorio de GitHub.
