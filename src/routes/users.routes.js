// src/routes/users.routes.js
const { Router } = require("express");
const userController = require("../controllers/user.controller.js");

const router = Router();

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
