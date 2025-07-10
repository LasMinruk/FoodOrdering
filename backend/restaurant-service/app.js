import express from "express";
import connectDB from "./config/db.js";
import restaurantRoutes from "./routes/resturentRoutes.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/restaurant", restaurantRoutes);

const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
  console.log(`Restaurant service running on port ${PORT}`);
});
