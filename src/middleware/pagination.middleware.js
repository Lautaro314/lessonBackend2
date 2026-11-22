const { parsePagination } = require("../utils/pagination.util.js");

// Valida page/limit antes de llegar al servicio y expone skip en req.pagination.
const paginate = (req, res, next) => {
    try {
        req.pagination = parsePagination(req.query);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = paginate;
