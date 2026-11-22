const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const UserModel = require("../models/user.model");
const { AUTH_COOKIE_NAME } = require("../utils/authCookie");

const config = require("./env.config.js");
require("../strategies/local.strategy");
require("../strategies/google.strategy");

const cookieExtractor = (req) => {
    if (req?.cookies?.[AUTH_COOKIE_NAME]) {
        return req.cookies[AUTH_COOKIE_NAME];
    }
    return null;
};

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
    ]),
    secretOrKey: config.jwtSecret,
};

passport.use(
    new JwtStrategy(jwtOptions, (payload, done) => {
        return done(null, payload);
    })
);

passport.serializeUser((user, done) => {
    done(null, user._id);
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
