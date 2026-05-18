const passport = require("passport");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const UserModel = require("../models/user.model");


passport.use(

    new GoogleStrategy(

        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK
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