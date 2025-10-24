import express from "express";
import Trainer from "../models/Trainer.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Ensure trainer profile exists for user
const getOrCreateTrainer = async (userId) => {
  let trainer = await Trainer.findOne({ userId });
  if (!trainer) {
    trainer = await Trainer.create({ userId });
  }
  return trainer;
};

// Get all services for the authenticated trainer
router.get("/", authenticateToken, async (req, res) => {
  try {
    const trainer = await getOrCreateTrainer(req.userId);
    res.json(trainer.services);
  } catch (error) {
    console.error("Get trainer services error:", error);
    res.status(500).json({ message: "Server error fetching trainer services" });
  }
});

// Add a new service (tiered or custom)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description, tier, basePrice, price, duration, serviceTypes, frequency, daysPerWeek } = req.body;

    if (!name || !tier || typeof price !== "number" || typeof basePrice !== "number") {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (price < basePrice) {
      return res.status(400).json({ message: "Price must be at least the base price" });
    }

    const trainer = await getOrCreateTrainer(req.userId);

    // derive duration/frequency for tiers
    let finalDuration = duration;
    let finalFrequency = frequency;
    let finalDaysPerWeek = daysPerWeek;

    if (tier !== "custom") {
      if (tier === "tier1") {
        finalDuration = "1 week";
        finalFrequency = "daily";
        finalDaysPerWeek = undefined;
      } else if (tier === "tier2") {
        finalDuration = "2 weeks";
        finalFrequency = "alternate";
        finalDaysPerWeek = undefined;
      } else if (tier === "tier3") {
        finalDuration = "3 weeks";
        finalFrequency = "days_per_week";
        finalDaysPerWeek = 5;
      }
    } else {
      if (!finalDuration) return res.status(400).json({ message: "Duration is required for custom services" });
      if (!finalFrequency) return res.status(400).json({ message: "Frequency is required for custom services" });
      if (finalFrequency === "days_per_week") {
        const n = Number(finalDaysPerWeek);
        if (!n || n < 1 || n > 6) return res.status(400).json({ message: "daysPerWeek must be between 1 and 6" });
      }
    }

    const newService = {
      serviceName: name,
      description,
      tier,
      basePrice,
      price,
      duration: finalDuration,
      frequency: finalFrequency,
      daysPerWeek: finalDaysPerWeek,
      serviceTypes: Array.isArray(serviceTypes) ? serviceTypes : [],
    };

    trainer.services.push(newService);
    await trainer.save();

    res.status(201).json(trainer.services[trainer.services.length - 1]);
  } catch (error) {
    console.error("Create trainer service error:", error);
    res.status(500).json({ message: "Server error creating trainer service" });
  }
});

// Update a specific service
router.put("/:serviceId", authenticateToken, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, description, tier, basePrice, price, duration, serviceTypes, frequency, daysPerWeek } = req.body;

    const trainer = await getOrCreateTrainer(req.userId);
    const service = trainer.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (price !== undefined && basePrice !== undefined && price < basePrice) {
      return res.status(400).json({ message: "Price must be at least the base price" });
    }

    if (name !== undefined) service.serviceName = name;
    if (description !== undefined) service.description = description;
    if (tier !== undefined) service.tier = tier;
    if (basePrice !== undefined) service.basePrice = basePrice;
    if (price !== undefined) service.price = price;
    if (duration !== undefined) service.duration = duration;
    if (frequency !== undefined) service.frequency = frequency;
    if (daysPerWeek !== undefined) service.daysPerWeek = daysPerWeek;
    if (serviceTypes !== undefined) service.serviceTypes = Array.isArray(serviceTypes) ? serviceTypes : [];

    // Re-derive defaults if a tier is set and custom fields are absent
    if (service.tier !== "custom") {
      if (service.tier === "tier1") {
        service.duration = "1 week";
        service.frequency = "daily";
        service.daysPerWeek = undefined;
      } else if (service.tier === "tier2") {
        service.duration = "2 weeks";
        service.frequency = "alternate";
        service.daysPerWeek = undefined;
      } else if (service.tier === "tier3") {
        service.duration = "3 weeks";
        service.frequency = "days_per_week";
        service.daysPerWeek = 5;
      }
    }

    await trainer.save();
    res.json(service);
  } catch (error) {
    console.error("Update trainer service error:", error);
    res.status(500).json({ message: "Server error updating trainer service" });
  }
});

// Delete a specific service
router.delete("/:serviceId", authenticateToken, async (req, res) => {
  try {
    const { serviceId } = req.params;

    const trainer = await getOrCreateTrainer(req.userId);
    const service = trainer.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    trainer.services.pull(serviceId);
    await trainer.save();

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete trainer service error:", error);
    res.status(500).json({ message: "Server error deleting trainer service" });
  }
});

// Public: Get services by trainer's userId (BUser _id)
router.get("/public/by-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const trainer = await Trainer.findOne({ userId });
    if (!trainer) return res.json([]);
    res.json(trainer.services || []);
  } catch (error) {
    console.error("Public get trainer services by userId error:", error);
    res.status(500).json({ message: "Server error fetching trainer services" });
  }
});

// Public: Get services by trainer document _id
router.get("/public/by-trainer/:trainerId", async (req, res) => {
  try {
    const { trainerId } = req.params;
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.json([]);
    res.json(trainer.services || []);
  } catch (error) {
    console.error("Public get trainer services by trainerId error:", error);
    res.status(500).json({ message: "Server error fetching trainer services" });
  }
});

export default router;
