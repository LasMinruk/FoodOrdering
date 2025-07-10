import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  socket.on("join_order_updates", (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Client joined order updates for: ${orderId}`);
  });
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Export io for use in other files
export { io };

// Routes
import orderRoutes from "./routes/orderRoutes.js";
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));