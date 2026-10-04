// src/models/user.model.js
const { Schema, model } = require("mongoose");
const { ROLES } = require("../constants/index.js");

const userSchema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserModel = model("User", userSchema);

module.exports = UserModel;
