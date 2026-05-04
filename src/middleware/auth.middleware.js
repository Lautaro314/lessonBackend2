const jwt = require('jsonwebtoken');

//validar jwt
const protectRoute = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 401,
            error: "Unauthorized",
            message: "Token requerido!"
        });
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload;
        next()
    } catch (error) {
        return res.status(401).json({
            status: 401,
            error: "Unauthorized",
            message: "Token inválido!"
        });
    }

}


//validar roles
const roleRestriction = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.usuario || !roles.includes(req.usuario.role)) {
                return res.status(403).json({
                    status: 403,
                    error: "Forbidden",
                    message: "No tenés permisos para acceder"
                });
            }
            next();
        } catch (error) {
            console.error("Error en roles:", error);
            return res.status(500).json({
                status: 500,
                error: "Internal Server Error",
                message: "Error del servidor"
            });
        }
    };
}

module.exports = { protectRoute, roleRestriction };