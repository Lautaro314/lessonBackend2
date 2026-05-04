const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const authRoutes = require("./routes/auth.routes.js");
const usersRoutes = require("./routes/users.routes.js")
require("dotenv").config();
const connectDB = require("./config/db");
const passport = require("./config/passport.js")
const { protectRoute, roleRestriction } = require("./middleware/auth.middleware.js");
const { errorHandler } = require("./middleware/error.middleware.js");

// Inicialization
const app = express();
const PORT = process.env.PORT || 8080;
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SECRET));
app.use(passport.initialize());


// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));




//endpoints disponibles para el manejo de la sesión 
app.use("/api/v1/users", usersRoutes)
app.use("/api/v1/auth", authRoutes);


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

