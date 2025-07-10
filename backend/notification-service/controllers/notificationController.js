import Notification from "../models/Notification.js";
import { sendEmail } from "../config/emailService.js";
import { sendSMS } from "../config/smsService.js";
import axios from "axios";
import { io } from "../server.js";

// Create notification
export const createNotification = async (req, res) => {
  try {
    const { userId, type, content } = req.body;

    // Get user info from auth-service
    const userResponse = await axios.get(
      `http://auth-service:5007/api/auth/${userId}`
    );
    const user = userResponse.data;

    const notification = new Notification({
      userId,
      type,
      content,
    });

    await notification.save();

    let result;

    if (type === "email" && user.email) {
      result = await sendEmail(
        user.email,
        "Food Delivery Notification",
        content
      );
    } else if (type === "sms" && user.phone) {
      result = await sendSMS(user.phone, content);
    } else if (type === "push") {
      // Send real-time notification through socket.io
      io.to(userId).emit("notification", {
        id: notification._id,
        content,
        createdAt: notification.createdAt,
      });
      result = { success: true };
    }

    notification.status = result?.success ? "sent" : "failed";
    await notification.save();

    res.status(201).json({
      success: true,
      notification,
      deliveryStatus: result,
    });
  } catch (error) {
    console.error("Notification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create notification from socket event
export const createNotificationFromSocket = async (data) => {
  try {
    const { userId, type, content } = data;

    const notification = new Notification({
      userId,
      type,
      content,
      status: "sent", // Assume successful for push notifications
    });

    await notification.save();

    // If it's a push notification, we've already sent it via socket
    // For other types, we need to send them now
    if (type !== "push") {
      try {
        // Get user info from auth-service
        const userResponse = await axios.get(
          `http://auth-service:5007/api/auth/${userId}`
        );
        const user = userResponse.data;

        if (type === "email" && user.email) {
          await sendEmail(user.email, "Food Delivery Notification", content);
        } else if (type === "sms" && user.phone) {
          await sendSMS(user.phone, content);
        }
      } catch (error) {
        console.error("Failed to send notification:", error.message);
        notification.status = "failed";
        await notification.save();
      }
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification from socket:", error);
    return null;
  }
};

// Get notification history for a user
export const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread notification count for a user
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//new routes
// Subscribe to notification channels
// export const subscribeToNotifications = async (req, res) => {
//   try {
//     const { userId, channels } = req.body;

//     // Get user info from auth-service
//     const userResponse = await axios.get(
//       `http://auth-service:5007/api/auth/${userId}`
//     );
//     const user = userResponse.data;

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     // Update user preferences in auth service
//     await axios.put(
//       `http://auth-service:5007/api/auth/notification-preferences/${userId}`,
//       {
//         notificationPreferences: channels,
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Notification preferences updated successfully",
//     });
//   } catch (error) {
//     console.error("Notification subscription error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Send batch notifications (for marketing campaigns, updates, etc.)
// export const sendBatchNotifications = async (req, res) => {
//   try {
//     const { userIds, type, content } = req.body;

//     const results = [];

//     for (const userId of userIds) {
//       try {
//         const notification = new Notification({
//           userId,
//           type,
//           content,
//         });

//         await notification.save();

//         // Get user info from auth-service
//         const userResponse = await axios.get(
//           `http://auth-service:5007/api/auth/${userId}`
//         );
//         const user = userResponse.data;

//         let result = { success: false };

//         if (type === "email" && user.email) {
//           result = await sendEmail(
//             user.email,
//             "Food Delivery Notification",
//             content
//           );
//         } else if (type === "sms" && user.phone) {
//           result = await sendSMS(user.phone, content);
//         } else if (type === "push") {
//           io.to(userId).emit("notification", {
//             id: notification._id,
//             content,
//             createdAt: notification.createdAt,
//           });
//           result = { success: true };
//         }

//         notification.status = result?.success ? "sent" : "failed";
//         await notification.save();

//         results.push({
//           userId,
//           notificationId: notification._id,
//           status: notification.status,
//         });
//       } catch (error) {
//         results.push({
//           userId,
//           error: error.message,
//           status: "failed",
//         });
//       }
//     }

//     res.status(200).json({
//       success: true,
//       results,
//     });
//   } catch (error) {
//     console.error("Batch notification error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Mark all notifications as read for a user
// export const markAllAsRead = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     await Notification.updateMany({ userId, isRead: false }, { isRead: true });

//     res.status(200).json({ message: "All notifications marked as read" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get notification statistics (admin)
// export const getNotificationStats = async (req, res) => {
//   try {
//     // Count of notifications by type
//     const typeStats = await Notification.aggregate([
//       { $group: { _id: "$type", count: { $sum: 1 } } },
//     ]);

//     // Count of notifications by status
//     const statusStats = await Notification.aggregate([
//       { $group: { _id: "$status", count: { $sum: 1 } } },
//     ]);

//     // Count of notifications in the last 24 hours
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     const recentCount = await Notification.countDocuments({
//       createdAt: { $gte: yesterday },
//     });

//     res.status(200).json({
//       byType: typeStats,
//       byStatus: statusStats,
//       last24Hours: recentCount,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
