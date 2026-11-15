const ERROR_TYPES = Object.freeze({
  INVALID_ARGUMENT: { status: 400, message: "Argumento inválido o faltante" },
  INVALID_STATUS: { status: 400, message: "El estado proporcionado no es válido" },
  USER_NOT_FOUND: { status: 404, message: "El usuario solicitado no existe" },
  ORDER_NOT_FOUND: { status: 404, message: "El pedido solicitado no existe" },
  ROUTE_NOT_FOUND: { status: 404, message: "La ruta solicitada no existe" },
  DUPLICATE_EMAIL: { status: 400, message: "El correo electrónico ya se encuentra registrado" },
  DATABASE_ERROR: { status: 500, message: "Error interno en la base de datos" },
});

module.exports = { ERROR_TYPES };