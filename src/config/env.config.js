const dotenv = require("dotenv");
const path = require("path");

// Entorno de testing separado del de desarrollo
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const requiredVariables = [
  "PORT",
  "MONGODB_URI",
  "NODE_ENV"
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Falta la variable de entorno obligatoria: ${variable}`);
  }
}

module.exports = {
  port: Number(process.env.PORT),
  mongodbUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV,
  mode: process.env.NODE_ENV
};

