const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const { createSessionMiddleware } = require("./config/session.js");
const authRoutes = require("./routes/auth.routes.js");
const usersRoutes = require("./routes/users.routes.js");
const config = require("./config/env.config.js");
const passport = require("./config/passport.js");
const { protectRoute, roleRestriction } = require("./middleware/auth.middleware.js");
const productRoutes = require("./routes/products.routes");
const processRoutes = require("./routes/process.routes");
const orderRoutes = require("./routes/order.routes");
const deliveryRoutes = require("./routes/delivery.routes");
const mockRoutes = require("./routes/mock.routes.js");
const healthRoutes = require("./routes/health.routes.js");
const internalOnly = require("./middleware/internal-only.middleware.js");
const errorMiddleware = require("./middleware/error.middleware.js");
const loggerRoutes = require("./routes/logger.routes.js");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger.config.js");
const CustomError = require("./utils/errors/custom-error.js");
const { ERROR_TYPES } = require("./constants/error.enums.js");

// Inicialización de la app (sin levantar el servidor ni conectar a la base)
const app = express();
const MODE = config.mode;
process.env.NODE_ENV = MODE;

app.disable("x-powered-by");

// Health check liviano: no depende de la base ni de las sesiones.
app.use("/health", healthRoutes);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.secret));

app.use(createSessionMiddleware());
app.use(passport.initialize());
app.use(passport.session());

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Endpoints disponibles para el manejo de la sesión
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/deliveries", deliveryRoutes);
app.use("/api/v1/mocks", internalOnly, mockRoutes);
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Endpoint para el uso del miniprograma fork
app.use("/api/v1/products", productRoutes);

// Endpoint para el manejo del proceso
app.use("/api/v1/process", internalOnly, processRoutes);
app.use("/api/v1/luces", internalOnly, loggerRoutes);
app.use("/api/v1/test", internalOnly, loggerRoutes);

app.get("/info", internalOnly, (req, res) => {
    res.json({
        pid: process.pid,
        env: process.env.NODE_ENV,
        memory: process.memoryUsage()
    });
});

app.get("/admin", protectRoute, roleRestriction(["admin"]), (req, res) => {
    res.send("Zona admin");
});

// Ruta inexistente: se delega al middleware global de errores
app.use((req, res, next) => {
    next(new CustomError(ERROR_TYPES.ROUTE_NOT_FOUND));
});

app.use(errorMiddleware);

module.exports = app;
