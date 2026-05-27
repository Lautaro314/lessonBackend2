const express = require("express");
const router = express.Router();
const { getSession, getProfile, getAdmin } = require("../controllers/api.controller");
const { protectRoute, roleRestriction } = require("../middleware/auth.middleware");

router.get("/session", getSession);
router.get("/profile", protectRoute, getProfile);
router.get("/admin", protectRoute, roleRestriction(["admin"]), getAdmin);

module.exports = router;
