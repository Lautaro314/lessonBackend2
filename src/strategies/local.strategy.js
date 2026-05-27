const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const UserModel = require("../models/user.model");
const { comparePassword } = require("../services/bcrypt");

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            session: true,
        },
        async (email, password, done) => {
            try {
                const user = await UserModel.findOne({ email });

                if (!user) {
                    return done(null, false, { message: "Usuario no encontrado" });
                }

                if (!user.password) {
                    return done(null, false, {
                        message: "Este usuario se registró con OAuth. Usá Google para ingresar.",
                    });
                }

                const isValid = await comparePassword(password, user.password);

                if (!isValid) {
                    return done(null, false, { message: "Credenciales incorrectas" });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);
