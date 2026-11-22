const mongoose = require("mongoose");
const CustomError = require("./errors/custom-error.js");
const { ERROR_TYPES } = require("../constants/error.enums.js");

const invalidFilter = (field) =>
    new CustomError({
        ...ERROR_TYPES.INVALID_ARGUMENT,
        message: `Filtro inválido: ${field}`,
    });

// allowedFilters: { campo: "objectId" | [valores válidos] | null }
// null significa texto libre (con longitud limitada). Solo se aceptan campos
// declarados, de modo que un query param no pueda alterar filtros internos
// como isDeleted ni inyectar operadores de MongoDB.
const buildSafeFilters = (query = {}, allowedFilters = {}) => {
    const filters = {};

    for (const [field, definition] of Object.entries(allowedFilters)) {
        const raw = query[field];
        if (raw === undefined || raw === null || raw === "") continue;

        const value = String(raw).trim();
        if (!value) continue;

        if (definition === "objectId") {
            if (!mongoose.isValidObjectId(value)) throw invalidFilter(field);
            filters[field] = value;
        } else if (Array.isArray(definition)) {
            if (!definition.includes(value)) throw invalidFilter(field);
            filters[field] = value;
        } else {
            if (value.length > 100) throw invalidFilter(field);
            filters[field] = value;
        }
    }

    return filters;
};

module.exports = { buildSafeFilters };
