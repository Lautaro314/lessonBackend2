const { Schema, model } = require("mongoose");
const { PRODUCT_STATUS } = require("../constants/index.js");

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.AVAILABLE,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProductModel = model("Product", productSchema);

module.exports = ProductModel;