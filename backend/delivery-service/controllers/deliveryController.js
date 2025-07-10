import Delivery from "../models/Delivery.js";
import { io } from "../app.js";
import axios from "axios";

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

async function getLiveLocation(agentId) {
  try {
    const { data } = await axios.get(`http://location-tracker:5009/api/location/${agentId}`);
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch location:", error);
    return null;
  }
}

// Assign a delivery to a delivery person  
/*Implement a system that automatically assigns delivery 
drivers based on order location and availability*/
export const assignDelivery = async (req, res) => {
  try {
    const { orderId, deliveryPersonId, userId, deliveryAddress, deliveryFee } =
      req.body;

    const delivery = await Delivery.create({
      orderId,
      deliveryPersonId,
      userId,
      deliveryAddress,
      deliveryFee,
    });

    // Notify delivery person via notification service
    await sendNotification(
      deliveryPersonId,
      "push",
      `New delivery assigned: Order #${orderId.substring(0, 8)}`
    );

    await sendNotification(
      deliveryPersonId,
      "email",
      `New delivery assigned: Order #${orderId.substring(
        0,
        8
      )}. Please check your app.`
    );

    // Notify customer that delivery has been assigned
    await sendNotification(
      userId,
      "push",
      `Your order has been assigned to a delivery person`
    );

    await sendNotification(
      userId,
      "email",
      `Your order #${orderId.substring(0, 8)} has been assigned to a delivery person.`
    );    

    // Emit socket event for real-time updates
    io.emit("delivery_assigned", {
      deliveryId: delivery._id,
      status: delivery.status,
      orderId: delivery.orderId,
    });

    res.status(201).json({ message: "Delivery assigned", delivery });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error assigning delivery", error: err.message });
  }
};

// Get deliveries for a delivery person
export const getDeliveriesByPerson = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;
    const deliveries = await Delivery.find({ deliveryPersonId });
    res.status(200).json(deliveries);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching deliveries", error: err.message });
  }
};

// Update delivery status
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.body;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    const updated = await Delivery.findByIdAndUpdate(
      deliveryId,
      { status },
      { new: true }
    );

    // Notify customer about status update
    await sendNotification(
      delivery.userId,
      "email",
      `Your delivery status is now: ${status}`
    );
    
    await sendNotification(
      delivery.userId,
      "sms",
      `Delivery update: ${status}`
    );
    
    await sendNotification(
      delivery.userId,
      "push",
      `Your delivery status is now: ${status}`
    );    

    // Emit socket event for real-time updates
    io.to(`delivery_${deliveryId}`).emit("delivery_status_update", {
      deliveryId: updated._id,
      status: updated.status,
      updatedAt: updated.updatedAt,
    });

    // If status is "delivered", notify order service
    if (status === "delivered") {
      try {
        await axios.put(
          `http://order-service:5001/api/orders/${delivery.orderId}`,
          {
            status: "Delivered",
          }
        );
      } catch (error) {
        console.error("Failed to update order status:", error.message);
      }
    }

    // ✅ now we send final response inside try block
    res.status(200).json({ message: "Delivery status updated", delivery: updated });

  } catch (err) { // catch the main try block
    res.status(500).json({ message: "Error updating status", error: err.message });
  }
};


// Update GPS location of delivery person
// export const updateDeliveryLocation = async (req, res) => {
//   try {
//     const { deliveryId } = req.params;
//     const { lat, lng } = req.body;

//     const delivery = await Delivery.findById(deliveryId);
//     if (!delivery) {
//       return res.status(404).json({ message: "Delivery not found" });
//     }

//     const updated = await Delivery.findByIdAndUpdate(
//       deliveryId,
//       {
//         locationUpdate: { lat, lng, updatedAt: Date.now() },
//       },
//       { new: true }
//     );

//     // Calculate and update estimated time if needed
//     // This is just a placeholder - in a real app, you would use maps API
//     const estimatedTime = calculateEstimatedTime(
//       lat,
//       lng,
//       delivery.deliveryAddress
//     );
//     if (estimatedTime !== delivery.estimatedTime) {
//       updated.estimatedTime = estimatedTime;
//       await updated.save();
//     }

//     // Emit socket event for real-time location updates
//     io.to(`delivery_${deliveryId}`).emit("delivery_location_update", {
//       deliveryId: updated._id,
//       location: updated.locationUpdate,
//       estimatedTime: updated.estimatedTime,
//     });

//     // Also emit to notification service socket
//     io.emit("locationUpdate", {
//       userId: delivery.userId,
//       deliveryId: updated._id,
//       location: updated.locationUpdate,
//       estimatedTime: updated.estimatedTime,
//     });

//     // Send email + SMS to customer
//     await sendNotification(
//       delivery.userId,
//       "email",
//       `🚚 Your delivery is on the way! Current location: (${lat}, ${lng})\nEstimated time of arrival: ${estimatedTime}.`
//     );

//     await sendNotification(
//       delivery.userId,
//       "sms",
//       `🚚 Delivery update: ETA ${estimatedTime}`
//     );

//     res.status(200).json({ message: "Location updated", delivery: updated });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error updating location", error: err.message });
//   }
// };

// Helper function to calculate estimated delivery time
function calculateEstimatedTime(lat, lng, deliveryAddress) {
  // This would normally use a maps API to calculate real ETA
  // For now, just return a placeholder value
  return "15-20 min";
}

// Get delivery details by ID
export const getDeliveryById = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json(delivery);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching delivery", error: err.message });
  }
};

// Track delivery by order ID (for customers)
export const trackDeliveryByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const delivery = await Delivery.findOne({ orderId });

    if (!delivery) {
      return res.status(404).json({ message: "No delivery found for this order" });
    }

    // 🔗 Fetch real-time location from tracker service
    const liveLocation = await getLiveLocation(delivery.deliveryPersonId);

    const response = {
      ...delivery.toObject(),
      liveLocation: liveLocation || null,
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "Error tracking delivery", error: err.message });
  }
};

//new routes
// For delivery person to view active deliveries and update earnings
export const getActiveDeliveries = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;
    const activeDeliveries = await Delivery.find({ 
      deliveryPersonId, 
      status: { $ne: "delivered" } 
    });
    
    res.status(200).json(activeDeliveries);
  } catch (err) {
    res.status(500).json({ 
      message: "Error fetching active deliveries", 
      error: err.message 
    });
  }
};

// For delivery person to update their earnings
export const updateDeliveryEarnings = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { actualDeliveryTime, additionalFees } = req.body;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    if (delivery.status !== "delivered") {
      return res.status(400).json({ message: "Cannot update earnings for undelivered order" });
    }

    const updated = await Delivery.findByIdAndUpdate(
      deliveryId,
      { 
        actualTime: actualDeliveryTime,
        additionalFees: additionalFees || 0
      },
      { new: true }
    );

    // Update wallet in user service for the delivery person
    try {
      await axios.post(`http://user-service:5002/api/wallet/credit`, {
        userId: delivery.deliveryPersonId,
        amount: delivery.deliveryFee + (additionalFees || 0),
        source: `Delivery #${deliveryId.substring(0, 8)}`
      });
    } catch (error) {
      console.error("Failed to update wallet:", error.message);
    }

    res.status(200).json({ 
      message: "Delivery earnings updated", 
      delivery: updated 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error updating earnings", 
      error: err.message 
    });
  }
};

// For admins to view all ongoing deliveries
export const getAllActiveDeliveries = async (req, res) => {
  try {
    const activeDeliveries = await Delivery.find({ 
      status: { $ne: "delivered" } 
    })
    .sort({ createdAt: -1 });
    
    // Enhance deliveries with user data from user-service
    const enhancedDeliveries = await Promise.all(activeDeliveries.map(async (delivery) => {
      const deliveryObj = delivery.toObject();
      
      try {
        // Get user data
        const userResponse = await axios.get(`http://user-service:5002/api/users/${delivery.userId}`);
        deliveryObj.userDetails = {
          name: userResponse.data.name,
          email: userResponse.data.email,
          phone: userResponse.data.phone
        };
        
        // Get delivery person data
        const deliveryPersonResponse = await axios.get(`http://user-service:5002/api/users/${delivery.deliveryPersonId}`);
        deliveryObj.deliveryPersonDetails = {
          name: deliveryPersonResponse.data.name,
          email: deliveryPersonResponse.data.email,
          phone: deliveryPersonResponse.data.phone
        };
      } catch (error) {
        console.error("Failed to fetch user details:", error.message);
      }
      
      return deliveryObj;
    }));
    
    res.status(200).json(enhancedDeliveries);
  } catch (err) {
    res.status(500).json({ 
      message: "Error fetching active deliveries", 
      error: err.message 
    });
  }
};

// For customer to rate delivery
export const rateDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { rating, feedback } = req.body;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    if (delivery.status !== "delivered") {
      return res.status(400).json({ message: "Cannot rate undelivered order" });
    }

    const updated = await Delivery.findByIdAndUpdate(
      deliveryId,
      { 
        rating,
        feedback
      },
      { new: true }
    );

    // Update delivery person's rating in user service
    try {
      await axios.post(`http://user-service:5002/api/users/rating`, {
        userId: delivery.deliveryPersonId,
        rating,
        deliveryId
      });
    } catch (error) {
      console.error("Failed to update delivery person rating:", error.message);
    }

    // Notify delivery person about new rating
    await sendNotification(
      delivery.deliveryPersonId,
      "push",
      `You received a ${rating}-star rating for your recent delivery`
    );

    res.status(200).json({ 
      message: "Delivery rated successfully", 
      delivery: updated 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error rating delivery", 
      error: err.message 
    });
  }
};

// Automatically assign delivery to nearest available delivery person
export const autoAssignDelivery = async (req, res) => {
  try {
    const { orderId, userId, deliveryAddress, deliveryFee, restaurantLocation } = req.body;

    // Call location service to find nearest available delivery person
    let deliveryPersonId;
    try {
      const { data } = await axios.post(`http://location-tracker:5009/api/nearest-agent`, {
        originLat: restaurantLocation.latitude,
        originLng: restaurantLocation.longitude,
        maxDistance: 5000, // 5km radius
        status: "available"
      });
      
      deliveryPersonId = data.agentId;
    } catch (error) {
      console.error("Failed to find nearest delivery person:", error.message);
      return res.status(404).json({ message: "No available delivery persons nearby" });
    }

    const delivery = await Delivery.create({
      orderId,
      deliveryPersonId,
      userId,
      deliveryAddress,
      deliveryFee,
    });

    // Notify delivery person
    await sendNotification(
      deliveryPersonId,
      "push",
      `New delivery assigned: Order #${orderId.substring(0, 8)}`
    );

    // Notify customer
    await sendNotification(
      userId,
      "push",
      `Your order has been assigned to a delivery person`
    );

    // Emit socket event
    io.emit("delivery_assigned", {
      deliveryId: delivery._id,
      status: delivery.status,
      orderId: delivery.orderId,
    });

    res.status(201).json({ message: "Delivery auto-assigned", delivery });
  } catch (err) {
    res.status(500).json({ 
      message: "Error auto-assigning delivery", 
      error: err.message 
    });
  }
};

// Get delivery person earnings history
export const getDeliveryEarnings = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = { 
      deliveryPersonId,
      status: "delivered"
    };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const deliveries = await Delivery.find(query);
    
    // Calculate total earnings
    const totalEarnings = deliveries.reduce((total, delivery) => {
      return total + delivery.deliveryFee + (delivery.additionalFees || 0);
    }, 0);
    
    res.status(200).json({
      deliveries,
      totalEarnings,
      count: deliveries.length
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error fetching earnings", 
      error: err.message 
    });
  }
};