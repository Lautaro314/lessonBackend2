const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const createSessionMiddleware = () =>
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            mongoUrl: process.env.MONGO_URL,
            collectionName: "sessions",
            ttl: 14 * 24 * 60 * 60,
        }),
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 14 * 24 * 60 * 60 * 1000,
        },
    });

module.exports = { createSessionMiddleware };
