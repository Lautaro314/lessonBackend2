const { Schema, model } = require("mongoose");
const { ORDER_STATUS } = require("../constants/index.js");

const deliverySchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    delivery_driver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tracking_code: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const DeliveryModel = model("Delivery", deliverySchema);
module.exports = DeliveryModel;