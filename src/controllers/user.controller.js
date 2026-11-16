const userService = require("../services/user.service.js");

class UserController {
  getUsers = async (req, res, next) => {
    try {
      const users = await userService.getAllUsers(req.query);
      res.status(200).json({ status: "success", payload: users });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.status(200).json({ status: "success", payload: user });
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req, res, next) => {
    try {
      const newUser = await userService.createUser(req.body);
      res.status(201).json({ status: "success", payload: newUser });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedUser = await userService.updateUser(id, req.body);
      res.status(200).json({ status: "success", payload: updatedUser });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      res.status(200).json({ status: "success", message: "Usuario eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  };

  uploadUserDocument = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedUser = await userService.addUserDocument(
        id,
        req.file,
        req.body.document_type
      );
      res.status(201).json({ status: "success", payload: updatedUser });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserController();