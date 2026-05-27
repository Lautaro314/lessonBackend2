const jwt = require("jsonwebtoken");
const { AUTH_COOKIE_NAME } = require("../utils/authCookie");

const getTokenFromRequest = (req) => {
    const bearer = req.headers.authorization?.split(" ")[1];
    return bearer || req.cookies?.[AUTH_COOKIE_NAME] || null;
};

const protectRoute = async (req, res, next) => {
    const token = getTokenFromRequest(req);

    if (!token) {
        return res.status(401).json({
            status: 401,
            error: "Unauthorized",
            message: "Token requerido!",
        });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload;
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 401,
            error: "Unauthorized",
            message: "Token inválido!",
        });
    }
};

const roleRestriction = (roles) => {
    return (req, res, next) => {
        if (!req.usuario || !roles.includes(req.usuario.role)) {
            return res.status(403).json({
                status: 403,
                error: "Forbidden",
                message: "No tenés permisos para acceder",
            });
        }
        next();
    };
};

module.exports = { protectRoute, roleRestriction, getTokenFromRequest };
