import mongoose from "mongoose";

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true, // typo corrected: should be `required` not `require`
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  specialNotes: {
    type: String,
    default: "",
  },
}, { _id: true });

// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: { // For location-based search
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  cuisine: { // Added for cuisine filter
    type: String,
    required: true,
  },
  rating: { // For filtering restaurants by ratings
    type: Number,
    default: 0,
  },
  reviewCount: { // To show no. of reviews
    type: Number,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  logo: {
    type: String,
    default: "",
  },
  bannerImage: {
    type: String,
    default: "",
  },
  menu: [menuItemSchema],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the model
const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
