//manejos de errores
const errorHandler = (err, req, res, next) => {
    const status = err.code || 500;

    res.status(status).json({
        status,
        error: err.message || 'Error interno del servidor',
    });
}

module.exports = { errorHandler }