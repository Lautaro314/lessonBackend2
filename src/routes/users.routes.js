const express = require("express");
const router = express.Router()

let users = [];

// middleware local
router.use((req, res, next) => {
    console.log(`Acceso a ${req.originalUrl}`);
    next();
});

// GET /users
router.get("/", (req, res) => {
    res.json(users);
});

// POST /users
router.post("/", (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            status: 400,
            error: "Error"
        });
    }

    users.push({ name });
    res.status(201).json({ message: "Usuario creado" });
});

module.exports = router;
