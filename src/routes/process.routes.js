const express = require("express");
const router = express.Router();
const { spawn, exec } = require("child_process")

const { blockingTask, delegatedTask } = require("../controllers/process.controller");


// middleware local
router.use((req, res, next) => {
    console.log(`Acceso a ${req.originalUrl}`);
    next();
});


// ruta bloqueante
router.get("/blocking", blockingTask);

// ruta delegada
router.get("/delegate", delegatedTask);

// ====================
// SPAWN
// ====================
router.get("/spawn", (req, res) => {

    const child = spawn("node", ["-v"]);

    let output = "";

    child.stdout.on("data", (data) => {
        output += data.toString();
    });

    child.on("close", () => {
        res.json({
            method: "spawn",
            result: output
        });
    });

});


// ====================
// EXEC
// ====================
router.get("/exec", (req, res) => {

    exec("node -v", (error, stdout, stderr) => {

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        res.json({
            method: "exec",
            result: stdout
        });

    });

});


module.exports = router;