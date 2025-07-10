const stripe = require("../config/stripe");
const Payment = require("../models/paymentModel");
// const { io } = require("../server");
const axios = require("axios");

// Function to send notifications
async function sendNotification(userId, type, content) {
  try {
    await axios.post("http://notification-service:5003/api/notifications", {
      userId,
      type,
      content,
    });
  } catch (error) {
    console.error("Failed to send notification:", error.message);
  }
}

// Create a payment intent and store record
exports.createPayment = async (req, res, io) => {
  const { orderId, userId, amount, paymentMethod } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
    });

    const payment = new Payment({
      orderId,
      userId,
      amount,
      paymentMethod,
      status: "pending",
      paymentIntentId: paymentIntent.id,
    });

    await payment.save();

    // Emit socket event for real-time updates
    io.emit("payment_created", {
      paymentId: payment._id,
      orderId: payment.orderId,
      status: payment.status,
    });

    res.status(201).json({
      message: "Payment intent created successfully",
      clientSecret: paymentIntent.client_secret,
      payment,
    });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Payment creation failed" });
  }
};

// Confirm payment and update status
exports.confirmPayment = async (req, res, io) => {
  const { paymentId } = req.params;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update payment status to completed
    payment.status = "completed";
    await payment.save();

    // Emit socket event for real-time updates
    io.to(`payment_${paymentId}`).emit("payment_updated", {
      paymentId: payment._id,
      status: "completed",
      updatedAt: payment.paymentDate,
    });

    // Send notification to user
    await sendNotification(
      payment.userId,
      "email",
      `Your payment of $${payment.amount} for order #${payment.orderId
        .toString()
        .substring(0, 8)} has been confirmed.`
    );

    await sendNotification(
      payment.userId,
      "sms",
      `Payment confirmed: $${payment.amount} for order #${payment.orderId
        .toString()
        .substring(0, 8)}`
    );

    // Update order status if payment is successful
    try {
      await axios.put(
        `http://order-service:5001/api/orders/${payment.orderId}`,
        { status: "Confirmed" },
        {
          headers: {
            Authorization: `Internal ${process.env.INTERNAL_SECRET}`,
          },
        }
      );
    } catch (error) {
      console.error("Failed to update order status:", error.message);
    }

    res.status(200).json({
      message: "Payment confirmed",
      payment,
    });
  } catch (err) {
    console.error("Payment confirmation error:", err.message);
    res.status(500).json({ error: "Payment confirmation failed" });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment" });
  }
};

// Get payment history for a user
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};

// Handle payment failure
exports.handlePaymentFailure = async (req, res, io) => {
  const { paymentId } = req.params;
  const { reason } = req.body;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update payment status to failed
    payment.status = "failed";
    payment.failureReason = reason || "Unknown error";
    await payment.save();

    // Emit socket event for real-time updates
    io.to(`payment_${paymentId}`).emit("payment_updated", {
      paymentId: payment._id,
      status: "failed",
      reason: payment.failureReason,
      updatedAt: new Date(),
    });

    // Send notification to user
    await sendNotification(
      payment.userId,
      "email",
      `Your payment for order #${payment.orderId
        .toString()
        .substring(0, 8)} has failed. Reason: ${payment.failureReason}`
    );

    res.status(200).json({
      message: "Payment failure recorded",
      payment,
    });
  } catch (err) {
    console.error("Payment failure handling error:", err.message);
    res.status(500).json({ error: "Payment failure handling failed" });
  }
};

//new routes
// Get payment statistics for a restaurant
exports.getRestaurantPaymentStats = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Get orders for this restaurant
    const ordersResponse = await axios.get(
      `http://order-service:5001/api/orders/restaurant/${restaurantId}`
    );
    const orders = ordersResponse.data;

    // Get payment data for these orders
    const orderIds = orders.map((order) => order._id);

    const payments = await Payment.find({
      orderId: { $in: orderIds },
    });

    // Calculate stats
    const totalPayments = payments.length;
    const totalAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Payments by method
    const paymentMethodStats = await Payment.aggregate([
      { $match: { orderId: { $in: orderIds } } },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Payments by status
    const paymentStatusStats = await Payment.aggregate([
      { $match: { orderId: { $in: orderIds } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      totalPayments,
      totalAmount,
      byMethod: paymentMethodStats,
      byStatus: paymentStatusStats,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment statistics" });
  }
};

// Get payment statistics for admin dashboard
exports.getAdminPaymentStats = async (req, res) => {
  try {
    // Total payments and amount
    const totalPayments = await Payment.countDocuments();

    const totalAmountResult = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalAmount =
      totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    // Payments by method
    const paymentMethodStats = await Payment.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Payments by status
    const paymentStatusStats = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Recent payments (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentPayments = await Payment.countDocuments({
      paymentDate: { $gte: yesterday },
    });

    const recentAmountResult = await Payment.aggregate([
      { $match: { paymentDate: { $gte: yesterday } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const recentAmount =
      recentAmountResult.length > 0 ? recentAmountResult[0].total : 0;

    res.json({
      totalPayments,
      totalAmount,
      byMethod: paymentMethodStats,
      byStatus: paymentStatusStats,
      recent: {
        count: recentPayments,
        amount: recentAmount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin payment statistics" });
  }
};

// Process refund
exports.processRefund = async (req, res, io) => {
  try {
    const { paymentId } = req.params;
    const { reason, amount } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
      amount: amount ? amount * 100 : undefined, // partial or full refund
    });

    // Create refund record
    const refundRecord = {
      originalPaymentId: payment._id,
      amount: amount || payment.amount,
      reason,
      processingDate: new Date(),
      refundId: refund.id,
      status: "completed",
    };

    // Update payment record
    payment.refunded = true;
    payment.refundDetails = refundRecord;
    await payment.save();

    // Emit socket event for real-time updates
    io.to(`payment_${paymentId}`).emit("payment_refunded", {
      paymentId: payment._id,
      refundId: refund.id,
      amount: amount || payment.amount,
      updatedAt: new Date(),
    });

    // Send notification to user
    await sendNotification(
      payment.userId,
      "email",
      `Your payment of $${amount || payment.amount} for order #${payment.orderId
        .toString()
        .substring(0, 8)} has been refunded. Reason: ${reason}`
    );

    await sendNotification(
      payment.userId,
      "sms",
      `Refund processed: $${
        amount || payment.amount
      } for order #${payment.orderId.toString().substring(0, 8)}`
    );

    res.status(200).json({
      message: "Refund processed successfully",
      refund: refundRecord,
    });
  } catch (err) {
    console.error("Refund processing error:", err.message);
    res.status(500).json({ error: "Refund processing failed" });
  }
};
