const jwt = require("jsonwebtoken");


const generateToken = (usuario) => {
    try {
        const payload = {
            id: usuario._id,
            email: usuario.email,
            role: usuario.role || 'user'
        };
        const token = jwt.sign(payload , process.env.JWT_SECRET , {expiresIn: '1h'})

        return token;

    } catch (error) {
        console.error("Error al generar el Token" , error);
    }


}

module.exports = generateToken;