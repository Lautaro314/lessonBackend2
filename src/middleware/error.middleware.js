const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const statusType = err.statusString || (statusCode >= 500 ? "error" : "fail");

  res.status(statusCode).json({
    status: statusType,
    error: err.message || "Error interno del servidor",
  });
};

module.exports = errorMiddleware;