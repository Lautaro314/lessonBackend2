const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const UserModel = require("../models/user.model");

require("dotenv").config();
require("../strategies/google.strategy");

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new Strategy(options, (payload, done) => {
    return done(null, payload);
}));

passport.serializeUser((user, done) => {

    done(null, user.id);

});

passport.deserializeUser(async (id, done) => {

    try {

        const user = await UserModel.findById(id);

        done(null, user);

    } catch (error) {

        done(error, null);

    }

});

module.exports = passport;
