const session = require("express-session");
const config = require("./env.config.js");

const createSessionMiddleware = () => {
    const options = {
        secret: config.secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: config.mode === "production",
            sameSite: "lax",
            maxAge: 4 * 60 * 60 * 1000,
        },
    };

    // En producción las sesiones van a MongoDB para sobrevivir reinicios.
    if (config.mode === "production") {
        const { MongoStore } = require("connect-mongo");
        options.store = new MongoStore({
            mongoUrl: config.mongodbUri,
            collectionName: "sessions",
            ttl: 4 * 60 * 60,
        });
    }

    return session(options);
};

module.exports = { createSessionMiddleware };
