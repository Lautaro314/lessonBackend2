const dotenv = require("dotenv");
const path = require("path");

// Entorno de testing separado del de desarrollo
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile), quiet: true });

const ALLOWED_MODES = ["development", "test", "production"];
const ALLOWED_LOG_LEVELS = ["fatal", "error", "warning", "info", "http", "debug"];

const requiredVariables = [
  "PORT",
  "MONGODB_URI",
  "NODE_ENV",
  "SECRET",
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK",
];

const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable] || !String(process.env[variable]).trim()
);
if (missingVariables.length > 0) {
  throw new Error(
    `No se puede iniciar ShipNow: faltan variables de entorno obligatorias: ${missingVariables.join(", ")}. ` +
      `Copiá .env.example a .env y completalas antes de arrancar.`
  );
}

const mode = process.env.NODE_ENV;
if (!ALLOWED_MODES.includes(mode)) {
  throw new Error(
    `No se puede iniciar ShipNow: NODE_ENV debe ser uno de ${ALLOWED_MODES.join(", ")} (recibido: ${mode}).`
  );
}

const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error(
    `No se puede iniciar ShipNow: PORT debe ser un entero entre 1 y 65535 (recibido: ${process.env.PORT}).`
  );
}

const logLevel = process.env.LOG_LEVEL || (mode === "production" ? "info" : "debug");
if (!ALLOWED_LOG_LEVELS.includes(logLevel)) {
  throw new Error(
    `No se puede iniciar ShipNow: LOG_LEVEL debe ser uno de ${ALLOWED_LOG_LEVELS.join(", ")} (recibido: ${logLevel}).`
  );
}

const publicUrl = process.env.PUBLIC_URL || `http://localhost:${port}`;

module.exports = {
  port,
  mongodbUri: process.env.MONGODB_URI,
  mode,
  nodeEnv: mode,
  logLevel,
  publicUrl,
  uploadsDir: process.env.UPLOADS_DIR,
  secret: process.env.SECRET,
  jwtSecret: process.env.JWT_SECRET,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK,
  },
};
