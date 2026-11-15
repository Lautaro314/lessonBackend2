// src/services/user.service.js
const userRepository = require("../repositories/user.repository.js");
const { ROLES } = require("../constants/index.js");
const { ERROR_TYPES } = require("../constants/error.enums.js");
const CustomError = require("../utils/errors/custom-error.js");

class UserService {
  async getAllUsers(filters) {
    return await userRepository.findAll(filters);
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new CustomError(ERROR_TYPES.USER_NOT_FOUND);
    }
    return user;
  }

  async createUser(userData) {
    if (!userData.email || !userData.password) {
      throw new CustomError(ERROR_TYPES.INVALID_ARGUMENT);
    }

    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new CustomError(ERROR_TYPES.DUPLICATE_EMAIL);
    }

    // Regla de negocio: asignar ROL por defecto si no se especifica o validar que sea correcto
    const role = Object.values(ROLES).includes(userData.role)
      ? userData.role
      : ROLES.USER;

    const newUserData = {
      ...userData,
      role,
    };

    const user = await userRepository.create(newUserData);
    
    // Ocultar password en el retorno
    const userObject = user.toObject();
    delete userObject.password;
    
    return userObject;
  }

  async updateUser(id, updateData) {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new CustomError(ERROR_TYPES.USER_NOT_FOUND);
    }

    if (updateData.role && !Object.values(ROLES).includes(updateData.role)) {
      throw new CustomError(ERROR_TYPES.INVALID_ARGUMENT);
    }

    return await userRepository.update(id, updateData);
  }

  async deleteUser(id) {
    const deleted = await userRepository.softDelete(id);
    if (!deleted) {
      throw new CustomError(ERROR_TYPES.USER_NOT_FOUND);
    }
    return deleted;
  }
}

module.exports = new UserService();