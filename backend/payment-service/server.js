const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/paymentservice")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection failed:", err));

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Client connected to payment service:", socket.id);

  socket.on("join_payment_updates", (paymentId) => {
    socket.join(`payment_${paymentId}`);
    console.log(`Client joined payment updates for: ${paymentId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected from payment service:", socket.id);
  });
});

// Routes (pass io to routes)
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes(io));

const PORT = process.env.PORT || 5004;
server.listen(PORT, () =>
  console.log(`Payment-Service running on port ${PORT}`)
);
