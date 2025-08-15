import express from "express";
import Vet from "../models/Vet.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get vet profile details
router.get("/", authenticateToken, async (req, res) => {
  try {
    const vetProfile = await Vet.findOne({ userId: req.userId });
    if (!vetProfile) {
      // If no profile exists, create one for the user
      const newVetProfile = await Vet.create({ userId: req.userId });
      return res.json(newVetProfile);
    }
    res.json(vetProfile);
  } catch (error) {
    console.error("Get vet profile error:", error);
    res.status(500).json({ message: "Server error fetching vet profile" });
  }
});

// Update vet profile settings
router.put("/", authenticateToken, async (req, res) => {
  try {
    const { emergency24Hrs } = req.body;

    // Add a strict check to ensure the value is a boolean
    if (typeof emergency24Hrs !== "boolean") {
      return res
        .status(400)
        .json({
          message:
            "Invalid value for emergency24Hrs. It must be a boolean (true or false).",
        });
    }

    // Find the vet profile and update it. 'upsert: true' will create it if it doesn't exist.
    const vetProfile = await Vet.findOneAndUpdate(
      { userId: req.userId },
      { $set: { emergency24Hrs: emergency24Hrs } },
      { new: true, upsert: true }
    );

    res.json(vetProfile);
  } catch (error) {
    console.error("Update vet profile error:", error);
    res.status(500).json({ message: "Server error updating vet profile" });
  }
});

export default router;
