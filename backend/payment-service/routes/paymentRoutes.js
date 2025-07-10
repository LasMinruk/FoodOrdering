const express = require("express");
const {
  createPayment,
  getPaymentById,
  getUserPayments,
  confirmPayment,
  handlePaymentFailure,
  getRestaurantPaymentStats,
  getAdminPaymentStats,
  processRefund,
} = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

module.exports = function (io) {
  const router = express.Router();

  // Pass io to controller functions using closure
  router.post("/create", (req, res) => createPayment(req, res, io));
  router.get(
    "/:id",
    authMiddleware,
    authorizeRoles("restaurant_admin", "admin"),
    getPaymentById
  );
  router.get(
    "/history/:userId",
    authMiddleware,
    authorizeRoles("restaurant_admin", "admin"),
    getUserPayments
  );
  router.put(
    "/confirm/:paymentId",
    authMiddleware,
    authorizeRoles("restaurant_admin", "admin"),
    (req, res) => confirmPayment(req, res, io)
  );
  router.put("/failure/:paymentId", (req, res) =>
    handlePaymentFailure(req, res, io)
  );

  // new routes
  router.get(
    "/stats/restaurant/:restaurantId",
    authMiddleware,
    authorizeRoles("restaurant_admin", "admin"),
    getRestaurantPaymentStats
  );
  router.get(
    "/stats/admin",
    authMiddleware,
    authorizeRoles("admin"),
    getAdminPaymentStats
  );
  router.post(
    "/refund/:paymentId",
    authMiddleware,
    authorizeRoles("admin"),
    (req, res) => processRefund(req, res, io)
  );

  return router;
};
