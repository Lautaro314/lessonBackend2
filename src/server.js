const app = require("./app.js");
const config = require("./config/env.config.js");
const { connectDB } = require("./config/db");
const logger = require("./config/logger.config.js");

const PORT = config.port;
const MODE = config.mode;

console.log("Servidor iniciando");
console.log("PID:", process.pid);
console.log("ENV:", process.env.NODE_ENV);

process.on("SIGINT", () => {
    console.log("Cerrando servidor...");
    process.exit();
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            logger.info(`Servidor corriendo en el puerto ${PORT}`);
            logger.info(`Modo: ${MODE}`);
        });
    } catch (error) {
        logger.error("Error al hacer la conexión", error);
    }
};

startServer();
