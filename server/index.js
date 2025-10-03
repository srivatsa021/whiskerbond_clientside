import dotenv from "dotenv";
import path from "path";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import vetServiceRoutes from "./routes/vet_services.js";
import trainerPlanRoutes from "./routes/trainer_plans.js";
import ngoPetRoutes from "./routes/ngo_pets.js"; // Import new NGO pet routes
import vetProfileRoutes from "./routes/vet_profile.js";
import vetBookingRoutes from "./routes/vet_bookings.js";
import groomerServiceRoutes from "./routes/groomer_services.js";
import groomerProfileRoutes from "./routes/groomer_profile.js";
import groomerBookingRoutes from "./routes/groomer_bookings.js";

// Load .env from the server folder (if present)
dotenv.config({ path: path.resolve("./server/.env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not set in environment or .env");
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
  })
  .catch((error) => {
    console.error("❌ Failed to connect to MongoDB Atlas:", error);
    process.exit(1); // hard stop if cloud is unreachable
  });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/vet-services", vetServiceRoutes);
app.use("/api/trainer-plans", trainerPlanRoutes);
app.use("/api/ngo-pets", ngoPetRoutes); // Use new NGO pet routes
app.use("/api/vet-profile", vetProfileRoutes);
app.use("/api/vet-bookings", vetBookingRoutes);
app.use("/api/groomer-services", groomerServiceRoutes);
app.use("/api/groomer-profile", groomerProfileRoutes);
app.use("/api/groomer-bookings", groomerBookingRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Serve frontend build files
const distPath = path.resolve(__dirname, "..", "dist");
app.use(express.static(distPath));

// Fallback to index.html for client-side routes (excluding API)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
