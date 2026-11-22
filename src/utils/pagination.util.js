const CustomError = require("./errors/custom-error.js");
const { ERROR_TYPES } = require("../constants/error.enums.js");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const invalidPagination = () =>
    new CustomError({
        ...ERROR_TYPES.INVALID_ARGUMENT,
        message: "Paginación inválida: page y limit deben ser enteros positivos (limit máximo 100)",
    });

const parsePagination = (query = {}) => {
    const page = query.page === undefined ? 1 : Number(query.page);
    const limit = query.limit === undefined ? DEFAULT_LIMIT : Number(query.limit);

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
        throw invalidPagination();
    }

    return { page, limit, skip: (page - 1) * limit };
};

const buildPagination = (total, page, limit) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
});

const sendPaginated = (res, { items, total }, pagination) =>
    res.json({
        status: "success",
        payload: items,
        pagination: buildPagination(total, pagination.page, pagination.limit),
    });

module.exports = {
    DEFAULT_LIMIT,
    MAX_LIMIT,
    parsePagination,
    buildPagination,
    sendPaginated,
};
