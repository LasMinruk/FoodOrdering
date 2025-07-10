import express from "express";
import {
  assignDelivery,
  getDeliveriesByPerson,
  updateDeliveryStatus,
  getDeliveryById,
  trackDeliveryByOrderId,
  getActiveDeliveries,
  updateDeliveryEarnings,
  getAllActiveDeliveries,
  rateDelivery,
  autoAssignDelivery,
  getDeliveryEarnings
} from "../controllers/deliveryController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const deliveryRoutes = express.Router();

// Existing routes
deliveryRoutes.post("/assign", assignDelivery);
deliveryRoutes.get("/driver/:deliveryPersonId", authMiddleware, authorizeRoles('delivery_person'), getDeliveriesByPerson);
deliveryRoutes.put("/status/:deliveryId", authMiddleware, authorizeRoles('delivery_person'), updateDeliveryStatus);
deliveryRoutes.get("/:deliveryId", authMiddleware, authorizeRoles('delivery_person', 'admin'), getDeliveryById);
deliveryRoutes.get("/track/:orderId", authMiddleware, authorizeRoles('customer'), trackDeliveryByOrderId);

// New routes
deliveryRoutes.post("/auto-assign", authMiddleware, authorizeRoles('admin', 'system'), autoAssignDelivery);
deliveryRoutes.get("/active/driver/:deliveryPersonId", authMiddleware, authorizeRoles('delivery_person'), getActiveDeliveries);
deliveryRoutes.get("/active/all", authMiddleware, authorizeRoles('admin', 'delivery_person'), getAllActiveDeliveries);
deliveryRoutes.put("/earnings/:deliveryId", authMiddleware, authorizeRoles('delivery_person'), updateDeliveryEarnings);
deliveryRoutes.get("/earnings/:deliveryPersonId", authMiddleware, authorizeRoles('delivery_person', 'admin'), getDeliveryEarnings);
deliveryRoutes.post("/rate/:deliveryId", authMiddleware, authorizeRoles('customer'), rateDelivery);

export default deliveryRoutes;