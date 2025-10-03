import express from "express";
import Groomer from "../models/Groomer.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get groomer profile details
router.get("/", authenticateToken, async (req, res) => {
  try {
    let groomerProfile = await Groomer.findOne({ userId: req.userId });
    if (!groomerProfile) {
      groomerProfile = await Groomer.create({ userId: req.userId });
    }
    res.json(groomerProfile);
  } catch (error) {
    console.error("Get groomer profile error:", error);
    res.status(500).json({ message: "Server error fetching groomer profile" });
  }
});

// Update groomer profile settings
router.put("/", authenticateToken, async (req, res) => {
  try {
    const {
      establishmentRegistrationNumber,
      establishmentRegistrationAuthority,
      establishmentRegistrationDocumentUrl,
      identityProofType,
      identityProofUrl,
    } = req.body;

    const updateFields = {
      ...(establishmentRegistrationNumber !== undefined && { establishmentRegistrationNumber }),
      ...(establishmentRegistrationAuthority !== undefined && { establishmentRegistrationAuthority }),
      ...(establishmentRegistrationDocumentUrl !== undefined && { establishmentRegistrationDocumentUrl }),
      ...(identityProofType !== undefined && { identityProofType }),
      ...(identityProofUrl !== undefined && { identityProofUrl }),
    };

    const groomerProfile = await Groomer.findOneAndUpdate(
      { userId: req.userId },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    res.json(groomerProfile);
  } catch (error) {
    console.error("Update groomer profile error:", error);
    res.status(500).json({ message: "Server error updating groomer profile" });
  }
});

export default router;
