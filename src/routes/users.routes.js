const express = require("express");
const router = express.Router();
const { getUsers, createUser } = require("../repositories/users.repository");

// middleware local
router.use((req, res, next) => {
    console.log(`Acceso a ${req.originalUrl}`);
    next();
});

// GET /users
router.get("/", async (req, res) => {
    try {
        const usersList = await getUsers();
        res.json(usersList);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

// POST /users
router.post("/", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                status: 400,
                error: "El nombre es requerido"
            });
        }

        const newUser = await createUser({ name });
        res.status(201).json({ message: "Usuario creado", payload: newUser });
    } catch (error) {
        res.status(500).json({ error: "Error al crear usuario" });
    }
});

module.exports = router;
