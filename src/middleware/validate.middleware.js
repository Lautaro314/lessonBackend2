const jwt = require('jsonwebtoken');

const validateRegister = async (req, res, next) => {

    const { email, password } = req.body;

    //validar email
    if (!email || typeof email !== "string") {
        return res.status(400).json({
            status: 400,
            error: 'email inválido'
        });
    }

    //validar contraseña
    if (!password || typeof password !== "string" || password.length < 4) {
        return res.status(400).json({
            status: 400,
            error: 'Contraseña inválida'
        });
    }
    next()
}

module.exports = { validateRegister };