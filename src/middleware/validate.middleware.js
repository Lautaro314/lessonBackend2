const jwt = require('jsonwebtoken');

const validateRegister = async (req, res, next) => {

    const { email, password } = req.body;

    //validar email
    if (!email || typeof email !== "string") {
        const error = new Error("email inválido");
        error.code = 400;
        return next(error)
    }

    //validación básica de formato email (mejor que nada)
    if (!email.includes("@")) {
        const error = new Error("Email debe contener @");
        error.code = 400;
        return next(error)
    }

    //validar contraseña
    if (!password || typeof password !== "string" || password.length < 4) {
        const error = new Error("contraseña inválida (minimo 4 caracteres)");
        error.code = 400;
        return next(error)
    }
    next()
}

module.exports = { validateRegister };