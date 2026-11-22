const mongoose = require("mongoose");
const app = require("./app.js");
const config = require("./config/env.config.js");
const { connectDB } = require("./config/db.js");
const logger = require("./config/logger.config.js");

const PORT = config.port;
let server;

const shutdown = async (signal) => {
    logger.info(`Se recibió ${signal}, cerrando servidor...`);
    if (server) {
        server.close(async () => {
            await mongoose.connection.close();
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

const startServer = async () => {
    try {
        await connectDB();
        server = app.listen(PORT, () => {
            logger.info(`Servidor corriendo en el puerto ${PORT}`);
            logger.info(`Modo: ${config.mode} - Log level: ${config.logLevel}`);
        });
    } catch (error) {
        logger.error("No se pudo iniciar el servidor", error);
        process.exit(1);
    }
};

startServer();
