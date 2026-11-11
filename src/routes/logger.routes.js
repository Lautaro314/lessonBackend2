const { Router } = require("express");
const logger = require("../config/logger.config.js");

const router = Router();

router.get("/loggerTest", (req, res) => {
  logger.debug("Mensaje de nivel: debug (Prueba)");
  logger.http("Mensaje de nivel: http (Prueba)");
  logger.info("Mensaje de nivel: info (Prueba)");
  logger.warning("Mensaje de nivel: warning (Prueba)");
  logger.error("Mensaje de nivel: error (Prueba)");
  logger.fatal("Mensaje de nivel: fatal (Prueba)");

  res.status(200).json({
    status: "success",
    message: "Logs de prueba generados correctamente en todos los niveles.",
  });
});

module.exports = router;