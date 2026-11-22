const { Router } = require("express");
const config = require("../config/env.config.js");

const router = Router();

// Diagnóstico mínimo: sin pid, memoria, URI de base ni secretos.
router.get("/", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.status(200).json({
        status: "ok",
        environment: config.mode,
        uptime: Number(process.uptime().toFixed(3)),
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
