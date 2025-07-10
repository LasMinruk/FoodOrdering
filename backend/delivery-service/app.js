import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";
import deliveryRoutes from "./routes/deliveryRoutes.js";

dotenv.config();
const app = express();

// Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

connectDB();

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected to delivery service:", socket.id);
  
  socket.on("join_delivery_tracking", (deliveryId) => {
    socket.join(`delivery_${deliveryId}`);
    console.log(`Client joined delivery tracking for: ${deliveryId}`);
  });
  
  socket.on("disconnect", () => {
    console.log("Client disconnected from delivery service:", socket.id);
  });
});

// Export io for use in controller
export { io };

app.use('/api/delivery', deliveryRoutes);

const PORT = process.env.PORT || 5010;
server.listen(PORT, () => {
  console.log(`Delivery service running on port ${PORT}`);
});