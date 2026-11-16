const ERROR_TYPES = Object.freeze({
  INVALID_ARGUMENT: { status: 400, message: "Argumento inválido o faltante" },
  INVALID_STATUS: { status: 400, message: "El estado proporcionado no es válido" },
  USER_NOT_FOUND: { status: 404, message: "El usuario solicitado no existe" },
  ORDER_NOT_FOUND: { status: 404, message: "El pedido solicitado no existe" },
  ROUTE_NOT_FOUND: { status: 404, message: "La ruta solicitada no existe" },
  DUPLICATE_EMAIL: { status: 400, message: "El correo electrónico ya se encuentra registrado" },
  DATABASE_ERROR: { status: 500, message: "Error interno en la base de datos" },
  // --- Errores de carga de archivos ---
  FILE_REQUIRED: { status: 400, message: "El archivo es obligatorio" },
  INVALID_FILE_TYPE: { status: 400, message: "El tipo de archivo no está permitido" },
  FILE_TOO_LARGE: { status: 400, message: "El archivo supera el tamaño máximo permitido (5MB)" },
  INVALID_DOCUMENT_TYPE: { status: 400, message: "El tipo de documento no es válido" },
  UNEXPECTED_FIELD: { status: 400, message: "El campo enviado no es el esperado" },
  FILE_SAVE_ERROR: { status: 500, message: "Error al guardar el archivo" },
  DELIVERY_NOT_FOUND: { status: 404, message: "La entrega solicitada no existe" },
});

module.exports = { ERROR_TYPES };