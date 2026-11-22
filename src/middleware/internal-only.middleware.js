const config = require("../config/env.config.js");
const CustomError = require("../utils/errors/custom-error.js");
const { ERROR_TYPES } = require("../constants/error.enums.js");

// Las herramientas de diagnóstico y generación de datos son internas:
// en producción se ocultan respondiendo 404 como una ruta inexistente.
const internalOnly = (req, res, next) => {
    if (config.mode === "production") {
        return next(new CustomError(ERROR_TYPES.ROUTE_NOT_FOUND));
    }
    next();
};

module.exports = internalOnly;
