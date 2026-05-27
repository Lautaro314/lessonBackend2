# Proyecto Final
## Sistema de Autenticacion Hibrido con Node.js

**Alumno:** Lautaro  
**Curso:** [Completar]  
**Fecha:** [Completar]  

---

## Indice

1. Presentacion del proyecto  
2. Arquitectura del proyecto  
3. Implementacion tecnica  
4. Seguridad y decisiones arquitectonicas  
5. Evidencia de funcionamiento  
6. Instrucciones de instalacion local  
7. Conclusion

---

## 1. Presentacion del proyecto

Este proyecto implementa un sistema de autenticacion hibrido desarrollado con Node.js y Express, utilizando MongoDB Atlas como base de datos principal.  

El sistema integra tres mecanismos complementarios:

- autenticacion local con email y password
- autenticacion OAuth con Google
- autorizacion mediante JWT y control por roles

### Objetivo arquitectonico

Construir una API organizada por capas, segura y mantenible, que permita registrar usuarios, iniciar sesion por distintos mecanismos, proteger rutas y gestionar sesiones persistentes.

### Estrategias de autenticacion implementadas

- **Local (Passport Local):** validacion de credenciales email/password.
- **OAuth Google (Passport Google):** login social con creacion automatica de usuario.
- **JWT:** token firmado con expiracion para proteger endpoints.
- **Cookie + Session:** almacenamiento de token en cookie `httpOnly` y sesion persistida en MongoDB.

### Justificacion breve del enfoque

Se eligio enfoque hibrido para combinar ventajas de session-based auth (OAuth) y token-based auth (APIs protegidas), con mejor experiencia de uso en cliente web y mayor control de seguridad.

---

## 2. Arquitectura del proyecto

### 2.1 Estructura de carpetas (arbol)

```text
lesson-backend2/
├── .env.example
├── package.json
├── RESUMEN.md
└── src/
    ├── app.js
    ├── config/
    │   ├── db.js
    │   ├── passport.js
    │   └── session.js
    ├── controllers/
    │   ├── api.controller.js
    │   └── auth.controller.js
    ├── middleware/
    │   ├── auth.middleware.js
    │   ├── error.middleware.js
    │   └── validate.middleware.js
    ├── models/
    │   └── user.model.js
    ├── routes/
    │   ├── api.routes.js
    │   └── auth.routes.js
    ├── services/
    │   ├── bcrypt.js
    │   └── user.auth.js
    ├── strategies/
    │   ├── google.strategy.js
    │   └── local.strategy.js
    └── utils/
        └── authCookie.js
```

### 2.2 Explicacion de capas

- **config:** conexion a base de datos, configuracion de Passport y sesiones.
- **models:** esquema de datos del usuario.
- **routes:** endpoints y composicion de middlewares.
- **controllers:** logica de negocio por caso de uso.
- **middleware:** validaciones, autenticacion/autorizacion y errores.
- **strategies:** estrategias de Passport para local y OAuth.

### 2.3 Diagrama simple del flujo de autenticacion

```text
[Cliente]
   |
   | POST /api/v1/auth/login
   v
[Passport Local] -- valida email/password --> [MongoDB]
   |
   | genera JWT {userId, role} expira 1h
   | setea cookie authToken (httpOnly, sameSite=lax, secure en prod)
   v
[Cliente autenticado]
   |
   | GET /api/v1/profile o /api/v1/admin
   v
[JWT middleware] -> [Role middleware] -> [Respuesta]
```

---

## 3. Implementacion tecnica

## 3.1 Registro de usuario

**Endpoint:** `POST /api/v1/auth/register`

### Codigo relevante del modelo `User`

```js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  googleId: String
});
```

### Ejemplo de hash con bcrypt

```js
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};
```

### Validacion de duplicados

```js
const existingUser = await UserModel.findOne({ email });
if (existingUser) {
  return res.status(400).json({ message: "El correo ya esta en uso" });
}
```

### Request real (pegar captura)

**[PEGAR CAPTURA 1 - REGISTER REQUEST/RESPONSE EN POSTMAN]**

Ejemplo:

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "lautaro@test.com",
  "password": "1234"
}
```

```json
{
  "token": "<jwt>",
  "user": {
    "userId": "6653d0a7812abcc123456789",
    "email": "lautaro@test.com",
    "role": "user"
  },
  "message": "Usuario creado correctamente"
}
```

---

## 3.2 Login local (Passport)

**Endpoint:** `POST /api/v1/auth/login`

### Configuracion de Passport Local Strategy

```js
new LocalStrategy(
  { usernameField: "email", passwordField: "password", session: true },
  async (email, password, done) => {
    const user = await UserModel.findOne({ email });
    if (!user) return done(null, false, { message: "Usuario no encontrado" });
    const isValid = await comparePassword(password, user.password);
    if (!isValid) return done(null, false, { message: "Credenciales incorrectas" });
    return done(null, user);
  }
);
```

### Generacion de JWT con `{ userId, role }` y expiracion de 1h

```js
const payload = {
  userId: user._id?.toString() || user.userId,
  role: user.role || "user"
};

return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
```

### Envio de token en body y cookie `authToken`

```js
res.cookie("authToken", token, {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 1000
});
```

### Request/Response reales (pegar captura)

**[PEGAR CAPTURA 2 - LOGIN LOCAL EXITOSO EN POSTMAN]**

---

## 3.3 Login OAuth (Google)

### Configuracion de estrategia

Se utiliza `passport-google-oauth20` con:

- `GET /api/v1/auth/google`
- `GET /api/v1/auth/google/callback`

### Codigo de creacion de usuario si no existe

```js
let user = await UserModel.findOne({ googleId: profile.id });

if (!user) {
  user = await UserModel.create({
    googleId: profile.id,
    email: profile.emails[0].value,
    role: "user"
  });
}
```

### Como se mantiene la sesion

Con `express-session`, `passport.session()`, `serializeUser/deserializeUser` y store persistente en MongoDB mediante `connect-mongo`.

---

## 3.4 Sistema de sesiones

### Configuracion de `express-session` + `connect-mongo`

```js
session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: "sessions",
    ttl: 14 * 24 * 60 * 60
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 14 * 24 * 60 * 60 * 1000
  }
});
```

### Ejemplo de documento de sesion en DB

```json
{
  "_id": "session-id",
  "expires": "2026-06-10T02:20:42.000Z",
  "session": "{\"passport\":{\"user\":\"6653d0a7812abcc123456789\"}}"
}
```

### Endpoint `GET /api/v1/session`

```json
{
  "sessionId": "session-id",
  "authenticated": true,
  "user": {
    "userId": "6653d0a7812abcc123456789",
    "email": "lautaro@test.com",
    "role": "user"
  }
}
```

**[PEGAR CAPTURA 3 - SESION ACTIVA EN POSTMAN]**

---

## 3.5 Rutas protegidas

### GET `/api/v1/profile` protegida por JWT

```http
GET /api/v1/profile
Authorization: Bearer <token>
```

### GET `/api/v1/admin` protegida por rol

```http
GET /api/v1/admin
Authorization: Bearer <token>
```

### Manejo de 401 y 403

401 - no autenticado:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Token requerido!"
}
```

403 - no autorizado:

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "No tenes permisos para acceder"
}
```

**[PEGAR CAPTURA 4 - PROFILE EXITOSO]**  
**[PEGAR CAPTURA 5 - ADMIN 403 CON USUARIO NORMAL]**  
**[PEGAR CAPTURA 6 - ADMIN 200 CON USUARIO ADMIN]**

---

## 3.6 Logout

**Endpoint:** `POST /api/v1/auth/logout`

### Evidencia tecnica

El logout implementado:

- destruye sesion
- limpia cookie de sesion (`connect.sid`)
- limpia cookie de autenticacion (`authToken`)
- obliga al cliente a descartar token almacenado localmente

```js
clearAuthCookie(res);
req.logout((err) => {
  if (err) return next(err);
  req.session.destroy((sessionErr) => {
    if (sessionErr) return next(sessionErr);
    res.clearCookie("connect.sid");
    res.json({ message: "Logout exitoso" });
  });
});
```

**[PEGAR CAPTURA 7 - LOGOUT EXITOSO]**

---

## 4. Seguridad y decisiones arquitectonicas

### Donde vive el rol y por que

El rol vive en el documento de usuario en MongoDB (`User.role`) como fuente de verdad. Se replica en el JWT para poder autorizar rapido sin consultar DB en cada request.

### Como se mitiga CSRF

- cookies con `sameSite: "lax"`
- cookies de auth con `httpOnly`
- validacion de permisos en backend por JWT + rol

### Diferenciacion local vs produccion

El atributo `secure` de cookies depende de `NODE_ENV`:

- desarrollo: `secure: false`
- produccion: `secure: true` (solo HTTPS)

### Por que cookie + JWT y no solo uno

JWT permite proteger APIs de forma stateless. Cookie `httpOnly` mejora seguridad y manejo en browser. Session resuelve adecuadamente el flujo OAuth de Passport. La combinacion responde al requisito de autenticacion hibrida.

### Que ocurre si cambia el rol con token ya emitido

El token viejo mantiene el rol hasta expirar (1h). Para escenarios estrictos se recomienda menor expiracion y/o invalidacion activa de tokens.

---

## 5. Evidencia de funcionamiento

En esta seccion deben incluirse evidencias reales del entorno ejecutado (sin enlaces externos).

Checklist final de evidencias:

- [ ] Captura registro (`POST /api/v1/auth/register`)
- [ ] Captura login (`POST /api/v1/auth/login`)
- [ ] Captura profile (`GET /api/v1/profile`)
- [ ] Captura admin (`GET /api/v1/admin`)
- [ ] Captura logout (`POST /api/v1/auth/logout`)
- [ ] Captura de token JWT en response
- [ ] Captura de cookie `authToken` correctamente configurada

Ejemplo de encabezado esperado:

```text
Set-Cookie: authToken=<jwt>; Max-Age=3600; Path=/; HttpOnly; SameSite=Lax
```

---

## 6. Instrucciones de instalacion local

### 6.1 Dependencias necesarias

- Node.js 18+
- npm
- MongoDB Atlas

### 6.2 Archivo `.env.example`

```env
PORT=8080
MONGO_URL=mongodb+srv://usuario:password@cluster.mongodb.net/nombreDB?retryWrites=true&w=majority
SECRET=clave_secreta_sesion
JWT_SECRET=clave_secreta_jwt
NODE_ENV=development
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK=http://localhost:8080/api/v1/auth/google/callback
```

### 6.3 Variables explicadas

- `PORT`: puerto de la API.
- `MONGO_URL`: cadena de conexion a Atlas.
- `SECRET`: secreto de session.
- `JWT_SECRET`: secreto de firma JWT.
- `NODE_ENV`: modo de ejecucion.
- `GOOGLE_CLIENT_ID/SECRET`: credenciales OAuth.
- `GOOGLE_CALLBACK`: URL de callback registrada.

### 6.4 Pasos de ejecucion

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` desde `.env.example` y completar valores.
3. Habilitar IP local en MongoDB Atlas.
4. Ejecutar servidor:

```bash
npm start
```

5. Probar endpoints en Postman.

---

## 7. Conclusion

El sistema cumple con la autenticacion hibrida solicitada, integrando login local, OAuth, JWT, sesiones persistidas y control de acceso por roles. La separacion por capas mejora mantenibilidad, y las medidas aplicadas fortalecen seguridad y trazabilidad del flujo de autenticacion.

