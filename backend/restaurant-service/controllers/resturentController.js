import Restaurant from "../models/Restaurant.js";
import mongoose from 'mongoose';

// Create a new restaurant
export const createRestaurant = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { name, address, contactNumber, ownerId, cuisine, logo, bannerImage } = req.body;

    if (!name || !address || !contactNumber || !cuisine || !ownerId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: "Invalid ownerId format" });
    }

    const newRestaurant = await Restaurant.create({
      name,
      address,
      contactNumber,
      cuisine,
      ownerId,
      logo,
      bannerImage,
    });
    res
      .status(201)
      .json({ message: "Restaurant created", restaurant: newRestaurant });
  } catch (err) {
    console.error('Error creating restaurant:', err);
    res
      .status(500)
      .json({ message: "Error creating restaurant", error: err.message });
  }
};

// Add a menu item
export const addMenuItem = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const menuItem = req.body;
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $push: { menu: menuItem } },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Menu item added", restaurant: updatedRestaurant });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding menu item", error: err.message });
  }
};

//update menu items
export const updateMenuItem = async (req, res) => {
  try {
    const { restaurantId, itemId } = req.params;
    const updateData = req.body;

    // dynamic update fields
    const updateFields = {};
    for (const key in updateData) {
      updateFields[`menu.$.${key}`] = updateData[key];
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      { _id: restaurantId, "menu._id": itemId },
      { $set: updateFields },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({ message: "Menu item updated", restaurant });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating menu item", error: err.message });
  }
};

// Delete a menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { restaurantId, itemId } = req.params;
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $pull: { menu: { _id: itemId } } },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Menu item deleted", restaurant: updatedRestaurant });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting menu item", error: err.message });
  }
};

// Set restaurant availability
export const setRestaurantAvailability = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { isAvailable } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { isAvailable },
      { new: true }
    );
    res.status(200).json({ message: "Availability updated", restaurant });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating availability", error: err.message });
  }
};

// Verify restaurant (admin only)
export const verifyRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { isVerified: true },
      { new: true }
    );
    res.status(200).json({ message: "Restaurant verified", restaurant });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error verifying restaurant", error: err.message });
  }
};

// Get all restaurants with optional filters
export const getRestaurants = async (req, res) => {
  try {
    const { query, cuisine, rating, location, ownerId, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Filter by owner ID (for restaurant owner dashboard)
    if (ownerId) {
      filter.ownerId = ownerId;
    } else {
      // Only apply availability and verification filters for public restaurant listings
      // not when a restaurant owner is looking up their own restaurant
      filter.isAvailable = true;
      filter.isVerified = true;
    }

    // Search by restaurant name
    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }

    // Filter by cuisine
    if (cuisine) {
      filter.cuisine = { $regex: cuisine, $options: "i" };
    }

    // Filter by rating
    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    // Filter by address / location
    if (location) {
      filter.address = { $regex: location, $options: "i" };
    }

    const restaurants = await Restaurant.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      message: "Error fetching restaurants",
      error: error.message,
    });
  }
};

// Get a single restaurant by ID
export const getRestaurantById = async (req, res) => {
  try {
    console.log("route hitttt"); // Debugging line
    console.log("Fetching restaurant by ID:", req.params.id); // Debugging line
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching restaurant", error: error.message });
  }
};
