const UserModel = require("../models/user.model.js");

class UserRepository {
  async findPaginated(filters = {}, { skip, limit }) {
    const query = { isDeleted: false, ...filters };
    const [items, total] = await Promise.all([
      UserModel.find(query)
        .select("-password")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query),
    ]);
    return { items, total };
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

  // 👇 MÉTODO NUEVO REQUERIDO PARA EL SEEDING
  async createMany(usersData) {
    return await UserModel.insertMany(usersData);
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

  // Registra los metadatos de un documento en la entidad usuario
  async addDocument(id, documentMetadata) {
    return await UserModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $push: { documents: documentMetadata } },
      { new: true }
    ).select("-password");
  }
}

module.exports = new UserRepository();