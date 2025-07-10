import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Location from "./models/Location.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Socket.IO setup
io.on("connection", (socket) => {
  console.log("🚚 Agent connected:", socket.id);

  socket.on("locationUpdate", async (data) => {
    const { agentId, latitude, longitude } = data;
    console.log("📍 Updating location:", agentId, latitude, longitude);

    await Location.findOneAndUpdate(
      { agentId },
      { latitude, longitude, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    io.emit("locationBroadcast", { agentId, latitude, longitude });
  });

  socket.on("disconnect", () => {
    console.log("❌ Agent disconnected:", socket.id);
  });
});

// REST API: Get agent location
app.get("/api/location/:agentId", async (req, res) => {
  try {
    const location = await Location.findOne({ agentId: req.params.agentId });
    if (!location)
      return res.status(404).json({ message: "Location not found" });
    res.status(200).json(location);
  } catch (err) {
    res.status(500).json({ message: "Error fetching location", error: err.message });
  }
});

// REST API: Update agent location
app.post("/api/location", async (req, res) => {
  try {
    const { agentId, latitude, longitude } = req.body;

    const location = await Location.findOneAndUpdate(
      { agentId },
      { latitude, longitude, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    io.emit("locationBroadcast", { agentId, latitude, longitude });

    res.status(200).json(location);
  } catch (err) {
    res.status(500).json({ message: "Error updating location", error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5009;
server.listen(PORT, () => {
  console.log(`🚀 Location-Tracker running on port ${PORT}`);
});
