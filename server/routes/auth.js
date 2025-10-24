import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import BUser from "../models/BUser.js";
import Walker from "../models/Walker.js";
import Boarding from "../models/Boarding.js";
import Trainer from "../models/Trainer.js";
import Vet from "../models/Vet.js";
import NGO from "../models/NGO.js";
import Groomer from "../models/Groomer.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper to check DB connection
const isDbConnected = () => mongoose.connection.readyState === 1;

// --- Validation Helper Functions ---

// Checks if a string is not null, undefined, or just whitespace
const isNotBlank = (str) => {
  return typeof str === 'string' && str.trim().length > 0;
};

// Validates email format (basic check for @ and something after it)
const isValidEmail = (email) => {
  // Regex for email: something@something.something
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validates contact number for exactly 10 digits
const isValidContactNo = (contactNo) => {
  // Regex for exactly 10 digits
  const phoneRegex = /^\d{10}$/;
  return typeof contactNo === 'string' && phoneRegex.test(contactNo);
};

// --- Routes ---

// Register
router.post("/register", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res
        .status(503)
        .json({ message: "Database down. Please try again later." });
    }

    const {
      businessName,
      name,
      email,
      contactNo,
      businessType,
      address,
      password,
      images,
    } = req.body;

    // --- Input Validation for Registration ---
    if (!isNotBlank(businessName)) {
      return res.status(400).json({ message: "Business Name cannot be empty." });
    }
    if (!isNotBlank(name)) {
      return res.status(400).json({ message: "Name cannot be empty." });
    }
    if (!isNotBlank(address)) {
      return res.status(400).json({ message: "Address cannot be empty." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    if (!isValidContactNo(contactNo)) {
      return res.status(400).json({ message: "Contact Number must be exactly 10 digits." });
    }
    if (!isNotBlank(password)) {
      return res.status(400).json({ message: "Password cannot be empty." });
    }
    // You might want to add password strength validation here too

    const existingUser = await BUser.findOne({ email, businessType });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already registered for this business type" });
    }

    // Validate images if provided
    let processedImages = [];
    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return res.status(400).json({ message: "Images must be an array" });
      }
      if (images.length > 10) {
        return res.status(400).json({ message: "A maximum of 10 images are allowed" });
      }
      for (const img of images) {
        if (typeof img !== "string" || !img.startsWith("data:image")) {
          return res.status(400).json({ message: "Invalid image format. Must be base64 data URL." });
        }
      }
      processedImages = images;
    }

    const newUser = new BUser({
      businessName,
      name,
      email,
      contactNo,
      businessType,
      address,
      password,
      images: processedImages,
    });

    await newUser.save();

    // Auto-create profile based on business type
    // (Existing logic, no changes needed here for validation)
    if (newUser.businessType === "walker") {
      const existingWalker = await Walker.findOne({ userId: newUser._id });
      if (!existingWalker) {
        await Walker.create({ userId: newUser._id });
        console.log(`✅ Walker profile created for ${newUser.email}`);
      }
    } else if (newUser.businessType === "boarding") {
      const existingBoarding = await Boarding.findOne({ userId: newUser._id });
      if (!existingBoarding) {
        await Boarding.create({ userId: newUser._id });
        console.log(`✅ Boarding profile created for ${newUser.email}`);
      }
    } else if (newUser.businessType === "trainer") {
      const existingTrainer = await Trainer.findOne({ userId: newUser._id });
      if (!existingTrainer) {
        await Trainer.create({ userId: newUser._id });
        console.log(`✅ Trainer profile created for ${newUser.email}`);
      }
    } else if (newUser.businessType === "vet") {
      const existingVet = await Vet.findOne({ userId: newUser._id });
      if (!existingVet) {
        await Vet.create({ userId: newUser._id });
        console.log(`✅ Vet profile created for ${newUser.email}`);
      }
    } else if (newUser.businessType === "groomer") {
      const existingGroomer = await Groomer.findOne({ userId: newUser._id });
      if (!existingGroomer) {
        await Groomer.create({ userId: newUser._id });
        console.log(`✅ Groomer profile created for ${newUser.email}`);
      }
    } else if (newUser.businessType === "ngo") {
      const existingNGO = await NGO.findOne({ userId: newUser._id });
      if (!existingNGO) {
        await NGO.create({ userId: newUser._id });
        console.log(`✅ NGO profile created for ${newUser.email}`);
      }
    }

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        businessName: newUser.businessName,
        name: newUser.name,
        email: newUser.email,
        contactNo: newUser.contactNo,
        businessType: newUser.businessType,
        address: newUser.address,
        images: newUser.images,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login (no changes needed for validation here)
router.post("/login", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res
        .status(503)
        .json({ message: "Database down. Please try again later." });
    }

    const { email, password } = req.body;

    const matchingUsers = await BUser.find({ email });
    if (!matchingUsers || matchingUsers.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = matchingUsers[0];

    // Defensive checks: ensure password field & comparePassword exist
    if (!user || !user.password || typeof user.comparePassword !== 'function') {
      console.warn('Login attempt for user missing password or comparePassword method', { email });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await user.comparePassword(password);
    } catch (cmpErr) {
      console.error('Error while comparing password for user', user._id?.toString ? user._id.toString() : user._id, cmpErr);
      // Treat as invalid credentials rather than internal server error to avoid leaking implementation details
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        id: user._id,
        businessName: user.businessName,
        name: user.name,
        email: user.email,
        contactNo: user.contactNo,
        businessType: user.businessType,
        address: user.address,
        images: user.images,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Get current user profile (no changes needed for validation here)
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await BUser.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      businessName: user.businessName,
      name: user.name,
      email: user.email,
      contactNo: user.contactNo,
      businessType: user.businessType,
      address: user.address,
      images: user.images,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { businessName, name, contactNo, address, email } = req.body;

    const user = await BUser.findById(req.userId); // Fetch current user to compare
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updateFields = {};
    let changesDetected = false;

    // Validate and check for changes in 'name'
    if (name !== undefined) {
      if (!isNotBlank(name)) {
        return res.status(400).json({ message: "Name cannot be empty." });
      }
      if (user.name !== name) {
        updateFields.name = name;
        changesDetected = true;
      }
    }

    // Validate and check for changes in 'email'
    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Invalid email format." });
      }
      if (user.email !== email) {
        updateFields.email = email;
        changesDetected = true;
      }
    }

    // Validate and check for changes in 'contactNo'
    if (contactNo !== undefined) {
      if (!isValidContactNo(contactNo)) {
        return res.status(400).json({ message: "Contact Number must be exactly 10 digits." });
      }
      if (user.contactNo !== contactNo) {
        updateFields.contactNo = contactNo;
        changesDetected = true;
      }
    }

    // Validate and check for changes in 'businessName' (if provided)
    if (businessName !== undefined) {
      if (!isNotBlank(businessName)) {
        return res.status(400).json({ message: "Business Name cannot be empty." });
      }
      if (user.businessName !== businessName) {
        updateFields.businessName = businessName;
        changesDetected = true;
      }
    }

    // Validate and check for changes in 'address' (if provided)
    if (address !== undefined) {
      if (!isNotBlank(address)) {
        return res.status(400).json({ message: "Address cannot be empty." });
      }
      if (user.address !== address) {
        updateFields.address = address;
        changesDetected = true;
      }
    }

    // If no changes were detected among the provided fields
    if (!changesDetected) {
      return res.status(400).json({ message: "No changes detected. Profile information is the same." });
    }

    // Perform the update only if changes were detected
    const updatedUser = await BUser.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      id: updatedUser._id,
      businessName: updatedUser.businessName,
      name: updatedUser.name,
      email: updatedUser.email,
      contactNo: updatedUser.contactNo,
      businessType: updatedUser.businessType,
      address: updatedUser.address,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    // Handle Mongoose validation errors specifically if they occur
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => error.errors[key].message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: "Server error during profile update" });
  }
});

// Update user images (replace entire array)
router.put("/profile/images", authenticateToken, async (req, res) => {
  try {
    const { images } = req.body;
    if (!Array.isArray(images)) {
      return res.status(400).json({ message: "Images must be an array" });
    }
    if (images.length > 10) {
      return res.status(400).json({ message: "A maximum of 10 images are allowed" });
    }
    for (const img of images) {
      if (typeof img !== "string" || !img.startsWith("data:image")) {
        return res.status(400).json({ message: "Invalid image format. Must be base64 data URL." });
      }
    }

    const updated = await BUser.findByIdAndUpdate(
      req.userId,
      { $set: { images } },
      { new: true, runValidators: true }
    ).select("images");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ images: updated.images });
  } catch (error) {
    console.error("Update images error:", error);
    res.status(500).json({ message: "Server error updating images" });
  }
});

export default router;
