import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  items: [{ name: String, quantity: Number, price: Number }],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "Pending" }, // Pending, Confirmed, Delivered
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);
