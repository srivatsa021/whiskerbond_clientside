import express from "express";
import Trainer from "../models/Trainer.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get trainer profile details
router.get("/", authenticateToken, async (req, res) => {
  try {
    let trainerProfile = await Trainer.findOne({ userId: req.userId });
    if (!trainerProfile) {
      trainerProfile = await Trainer.create({ userId: req.userId });
    }
    res.json(trainerProfile);
  } catch (error) {
    console.error("Get trainer profile error:", error);
    res.status(500).json({ message: "Server error fetching trainer profile" });
  }
});

// Update trainer profile settings (registration and identity fields)
router.put("/", authenticateToken, async (req, res) => {
  try {
    const {
      registrationNumber,
      registrationAuthority,
      registrationDocumentUrl,
      identityProofType,
      identityProofUrl,
    } = req.body;

    const updateFields = {
      ...(registrationNumber !== undefined && { registrationNumber }),
      ...(registrationAuthority !== undefined && { registrationAuthority }),
      ...(registrationDocumentUrl !== undefined && { registrationDocumentUrl }),
      ...(identityProofType !== undefined && { identityProofType }),
      ...(identityProofUrl !== undefined && { identityProofUrl }),
    };

    const trainerProfile = await Trainer.findOneAndUpdate(
      { userId: req.userId },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    res.json(trainerProfile);
  } catch (error) {
    console.error("Update trainer profile error:", error);
    res.status(500).json({ message: "Server error updating trainer profile" });
  }
});

export default router;
