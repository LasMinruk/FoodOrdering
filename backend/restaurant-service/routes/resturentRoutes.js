import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import { addMenuItem, createRestaurant, deleteMenuItem, setRestaurantAvailability, updateMenuItem, verifyRestaurant, getRestaurants, getRestaurantById } from "../controllers/resturentController.js";

const restaurantRoutes = express.Router();

restaurantRoutes.post('/',authMiddleware, authorizeRoles('restaurant_admin', 'admin'), createRestaurant);
restaurantRoutes.get('/', getRestaurants);
restaurantRoutes.get('/:id', getRestaurantById);

//Menu Management
restaurantRoutes.post('/:restaurantId/menu', authMiddleware, authorizeRoles('restaurant_admin'), addMenuItem);
restaurantRoutes.put('/:restaurantId/menu/:itemId', authMiddleware, authorizeRoles('restaurant_admin'), updateMenuItem);
restaurantRoutes.delete('/:restaurantId/menu/:itemId', authMiddleware, authorizeRoles('restaurant_admin'), deleteMenuItem);

restaurantRoutes.patch('/:restaurantId/availability', authMiddleware, authorizeRoles('restaurant_admin', 'admin'), setRestaurantAvailability);
restaurantRoutes.patch('/:restaurantId/verify', authMiddleware, authorizeRoles('admin'), verifyRestaurant);

export default restaurantRoutes;