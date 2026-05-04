const generateToken = require("../services/user.auth");
const { hashPassword, comparePassword } = require("../services/bcrypt");
const UserModel = require("../models/user.model.js");

//CON LOGIN ME GENERA EL TOKEN, LO USAMOS EN EL FRONTEND PARA LA PROTECCION DE RUTAS
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(401).json({
                status: 401,
                error: "Unauthorized",
                message: "Usuario no encontrado"
            })
        }

        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        };

        // Generamos el token usando el objeto plano o los datos necesarios
        const token = generateToken({ _id: user._id, email: user.email, role: user.role })
        res.json({ token })
    } catch (error) {
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
};


const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Faltan datos!" })
        }

        // Verificar si el usuario ya existe
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está en uso" });
        }

        const hashed = await hashPassword(password)

        // Crear el usuario en la base de datos
        const newUser = await UserModel.create({
            email,
            password: hashed
        });

        const token = generateToken({
            _id: newUser._id,
            //email: newUser.email,
            role: newUser.role
        })

        res.status(201).json({ message: "Usuario creado correctamente", token })

    } catch (error) {
        next(error)
    }
}

const getProducts = (req, res) => {
    res.json({
        message: `Bienvenido ${req.user.email} a la sección de productos.`
    });
};

module.exports = { login, getProducts, register };
