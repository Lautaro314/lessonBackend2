// src/services/user.service.js
const userRepository = require("../repositories/user.repository.js");
const { ROLES, USER_DOCUMENT_TYPES } = require("../constants/index.js");
const { ERROR_TYPES } = require("../constants/error.enums.js");
const CustomError = require("../utils/errors/custom-error.js");
const { buildFileMetadata, removeUploadedFile } = require("../utils/file.util.js");
const { buildSafeFilters } = require("../utils/query-filters.util.js");
const logger = require("../config/logger.config.js");

const USER_FILTERS = Object.freeze({
  email: null,
  role: Object.values(ROLES),
});

class UserService {
  async getAllUsers(query, pagination) {
    const filters = buildSafeFilters(query, USER_FILTERS);
    return await userRepository.findPaginated(filters, pagination);
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

  // Carga un documento del usuario y registra sus metadatos en la entidad
  async addUserDocument(userId, file, documentType) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new CustomError(ERROR_TYPES.USER_NOT_FOUND);
      }

      if (!file) {
        throw new CustomError(ERROR_TYPES.FILE_REQUIRED);
      }

      const normalizedType = documentType ? String(documentType).toUpperCase() : null;
      if (!normalizedType || !Object.values(USER_DOCUMENT_TYPES).includes(normalizedType)) {
        throw new CustomError(ERROR_TYPES.INVALID_DOCUMENT_TYPE);
      }

      const metadata = buildFileMetadata(file, normalizedType);

      const updated = await userRepository.addDocument(userId, metadata);
      if (!updated) {
        throw new CustomError(ERROR_TYPES.FILE_SAVE_ERROR);
      }

      logger.info(
        `Documento de usuario cargado: ${metadata.filename} (tipo ${normalizedType}) para el usuario ${userId}`
      );

      return updated;
    } catch (error) {
      // Si el archivo ya fue guardado en disco pero falló la asociación, lo eliminamos.
      if (file) {
        removeUploadedFile(file);
      }
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(ERROR_TYPES.FILE_SAVE_ERROR);
    }
  }
}

module.exports = new UserService();