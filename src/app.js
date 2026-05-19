const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const session = require("express-session");
const authRoutes = require("./routes/auth.routes.js");
const usersRoutes = require("./routes/users.routes.js")
require("dotenv").config();
const connectDB = require("./config/db");
const passport = require("./config/passport.js")
const { protectRoute, roleRestriction } = require("./middleware/auth.middleware.js");
const { errorHandler } = require("./middleware/error.middleware.js");
const productRoutes = require("./routes/products.routes");
const processRoutes = require("./routes/process.routes");

// Inicialization
const app = express();

function getConfig() {

    let mode = process.env.NODE_ENV || "development";
    let port = process.env.PORT || 8080;

    process.argv.slice(2).forEach(arg => {

        if (arg.startsWith("--port=")) {
            port = Number(arg.split("=")[1]);
        }

        if (arg.startsWith("--mode=")) {
            mode = arg.split("=")[1];
        }

    });

    return {
        mode,
        port
    };
}

const config = getConfig();
const PORT = config.port;
const MODE = config.mode;
process.env.NODE_ENV = MODE;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SECRET));
app.use(session({

    secret: process.env.SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {

        httpOnly: true,

        secure: process.env.NODE_ENV === "production",

        sameSite: "lax"

    }

}));
app.use(passport.initialize());
app.use(passport.session());


// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));




//endpoints disponibles para el manejo de la sesión 
app.use("/api/v1/users", usersRoutes)
app.use("/api/v1/auth", authRoutes);

//endpoint para el uso del miniprograma fork
app.use("/api/v1/products", productRoutes);

//endpoint para el manejo del proceso
app.use("/api/v1/process", processRoutes);
console.log("Servidor iniciando");
console.log("PID:", process.pid);
console.log("ENV:", process.env.NODE_ENV);

process.on("SIGINT", () => {
    console.log("Cerrando servidor...");
    process.exit();
});

app.get("/info", (req, res) => {

    res.json({
        pid: process.pid,
        env: process.env.NODE_ENV,
        memory: process.memoryUsage()
    });

});



app.get("/admin", protectRoute, roleRestriction(["admin"]), (req, res) => {
    res.send("Zona admin")
})

app.use((req, res) => {
    res.status(404).send("404 not found")
})


app.use(errorHandler);


// Sesión
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error("Error al hacer la conexión", error)
    }
}


startServer();

