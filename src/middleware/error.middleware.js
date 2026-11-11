const logger = require("../config/logger.config.js");
const CustomError = require("../utils/errors/custom-error.js");

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const statusType = err.statusString || (statusCode >= 500 ? "error" : "fail");

  // Registrar según la gravedad del error
  if (statusCode >= 500) {
    logger.error(`Error de servidor [500]: ${err.message} - Ruta: ${req.originalUrl}`);
  } else if (statusCode === 404) {
    logger.warning(`Recurso no encontrado [404]: ${req.originalUrl}`);
  } else {
    logger.warning(`Error de validación/cliente [${statusCode}]: ${err.message}`);
  }

  res.status(statusCode).json({
    status: statusType,
    error: err.message || "Error interno del servidor",
  });
};

module.exports = errorMiddleware;