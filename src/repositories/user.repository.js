// src/repositories/user.repository.js
const UserModel = require("../models/user.model.js");

class UserRepository {
  async findAll(filters = {}) {
    return await UserModel.find({ isDeleted: false, ...filters })
      .select("-password") // Oculta la contraseña por seguridad
      .lean();
  }

  async findById(id) {
    return await UserModel.findOne({ _id: id, isDeleted: false })
      .select("-password")
      .lean();
  }

  async findByEmail(email) {
    return await UserModel.findOne({ email, isDeleted: false }).lean();
  }

  async create(userData) {
    return await UserModel.create(userData);
  }

  async update(id, updateData) {
    return await UserModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    ).select("-password");
  }

  async softDelete(id) {
    return await UserModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
  }
}

module.exports = new UserRepository();