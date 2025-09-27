import dotenv from "dotenv";
import path from "path";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import vetServiceRoutes from "./routes/vet_services.js";
import trainerPlanRoutes from "./routes/trainer_plans.js";
import ngoPetRoutes from "./routes/ngo_pets.js"; // Import new NGO pet routes
import vetProfileRoutes from "./routes/vet_profile.js";
import vetBookingRoutes from "./routes/vet_bookings.js";

// Load .env from the server folder
dotenv.config({ path: path.resolve("./server/.env") });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not set in .env");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Connect to MongoDB Atlas (cloud only)
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    console.log(`🔗 Using URI: ${MONGODB_URI}`);
  })
  .catch((error) => {
    console.error("❌ Failed to connect to MongoDB Atlas:", error);
    process.exit(1); // hard stop if cloud is unreachable
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vet-services", vetServiceRoutes);
app.use("/api/trainer-plans", trainerPlanRoutes);
app.use("/api/ngo-pets", ngoPetRoutes); // Use new NGO pet routes
app.use("/api/vet-profile", vetProfileRoutes);
app.use("/api/vet-bookings", vetBookingRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
