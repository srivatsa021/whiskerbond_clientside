import express from "express";
import Trainer from "../models/Trainer.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get all training plans for the authenticated trainer
router.get("/", authenticateToken, async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ userId: req.userId });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer profile not found" });
    }
    res.json(trainer.trainingPlans);
  } catch (error) {
    console.error("Get trainer plans error:", error);
    res.status(500).json({ message: "Server error fetching training plans" });
  }
});

// Add a new training plan
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;

    const trainer = await Trainer.findOne({ userId: req.userId });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer profile not found" });
    }

    const newPlan = {
      serviceName: name,
      description,
      price,
      duration,
    };

    trainer.trainingPlans.push(newPlan);
    await trainer.save();

    res
      .status(201)
      .json(trainer.trainingPlans[trainer.trainingPlans.length - 1]);
  } catch (error) {
    console.error("Create training plan error:", error);
    res.status(500).json({ message: "Server error creating training plan" });
  }
});

// Update a training plan
router.put("/:planId", authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;
    const { name, description, price, duration } = req.body;

    const trainer = await Trainer.findOne({ userId: req.userId });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer profile not found" });
    }

    const plan = trainer.trainingPlans.id(planId);
    if (!plan) {
      return res.status(404).json({ message: "Training plan not found" });
    }

    plan.serviceName = name;
    plan.description = description;
    plan.price = price;
    plan.duration = duration;

    await trainer.save();
    res.json(plan);
  } catch (error) {
    console.error("Update training plan error:", error);
    res.status(500).json({ message: "Server error updating training plan" });
  }
});

// Delete a training plan
router.delete("/:planId", authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;

    const trainer = await Trainer.findOne({ userId: req.userId });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer profile not found" });
    }

    const plan = trainer.trainingPlans.id(planId);
    if (!plan) {
      return res.status(404).json({ message: "Training plan not found" });
    }

    trainer.trainingPlans.pull(planId);
    await trainer.save();
    res.json({ message: "Training plan deleted successfully" });
  } catch (error) {
    console.error("Delete training plan error:", error);
    res.status(500).json({ message: "Server error deleting training plan" });
  }
});

export default router;
