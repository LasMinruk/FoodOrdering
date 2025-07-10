import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }, // Ensure it's between 1 and 5
  review: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Review", reviewSchema);
