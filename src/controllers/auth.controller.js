const passport = require("passport");
const generateToken = require("../services/user.auth");
const { hashPassword } = require("../services/bcrypt");
const UserModel = require("../models/user.model.js");
const { setAuthCookie, clearAuthCookie } = require("../utils/authCookie");

const sendAuthResponse = (res, user, statusCode = 200) => {
    const token = generateToken(user);

    setAuthCookie(res, token);

    const body = {
        token,
        user: {
            userId: user._id,
            email: user.email,
            role: user.role,
        },
    };

    if (statusCode === 201) {
        body.message = "Usuario creado correctamente";
    }

    return res.status(statusCode).json(body);
};

const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Faltan datos!" });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está en uso" });
        }

        const hashed = await hashPassword(password);

        const newUser = await UserModel.create({
            email,
            password: hashed,
        });

        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            return sendAuthResponse(res, newUser, 201);
        });
    } catch (error) {
        next(error);
    }
};

const login = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({
                status: 401,
                error: "Unauthorized",
                message: info?.message || "Credenciales incorrectas",
            });
        }

        req.login(user, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }
            return sendAuthResponse(res, user);
        });
    })(req, res, next);
};

const logout = (req, res, next) => {
    clearAuthCookie(res);

    const finish = () =>
        res.json({
            message: "Logout exitoso",
            hint: "Eliminá también el token del cliente (localStorage/header Authorization) si lo guardaste.",
        });

    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return finish();
    }

    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.session.destroy((sessionErr) => {
            if (sessionErr) {
                return next(sessionErr);
            }
            res.clearCookie("connect.sid");
            finish();
        });
    });
};

const googleCallback = (req, res) => {
    const token = generateToken(req.user);
    setAuthCookie(res, token);

    res.json({
        message: "Login con Google exitoso",
        token,
        user: {
            userId: req.user._id,
            email: req.user.email,
            role: req.user.role,
        },
    });
};

const getProducts = (req, res) => {
    res.json({
        message: `Bienvenido ${req.user.userId} a la sección de productos.`,
        role: req.user.role,
    });
};

module.exports = {
    register,
    login,
    logout,
    googleCallback,
    getProducts,
};
