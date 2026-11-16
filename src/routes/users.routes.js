// src/routes/users.routes.js
const { Router } = require("express");
const userController = require("../controllers/user.controller.js");
const { uploadUserDocument } = require("../config/multer.config.js");

const router = Router();

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// Carga de documentos del usuario (multipart/form-data, campo "document")
router.post("/:id/documents", uploadUserDocument, userController.uploadUserDocument);

module.exports = router;
