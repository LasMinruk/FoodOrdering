import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  deliveryPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["assigned", "picked_up", "delivering", "delivered"],
    default: "assigned",
  },
  // locationUpdate: {
  //   lat: { type: Number },
  //   lng: { type: Number },
  //   updatedAt: { type: Date, default: Date.now },
  // },
  estimatedTime: { type: String },
  actualTime: { type: String },
  deliveryAddress: { type: String, required: true },
  deliveryFee: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Delivery = mongoose.model("Delivery", deliverySchema);
export default Delivery;