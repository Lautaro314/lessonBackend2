const passport = require("passport");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const UserModel = require("../models/user.model");
const config = require("../config/env.config.js");


passport.use(

    new GoogleStrategy(

        {
            clientID: config.google.clientId,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackUrl
        },

        async (accessToken, refreshToken, profile, done) => {

            try {

                // Buscar usuario existente
                let user = await UserModel.findOne({
                    googleId: profile.id
                });

                // Crear usuario si no existe
                if (!user) {

                    user = await UserModel.create({

                        googleId: profile.id,

                        email: profile.emails[0].value,

                        role: "user"

                    });

                }

                return done(null, user);

            } catch (error) {

                return done(error, null);

            }

        }

    )

);