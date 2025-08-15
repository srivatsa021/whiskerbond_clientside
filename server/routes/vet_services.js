import express from "express";
import Vet from "../models/Vet.js";
import { authenticateToken } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// Get all services for the authenticated vet
router.get("/", authenticateToken, async (req, res) => {
  try {
    const vet = await Vet.findOne({ userId: req.userId });
    if (!vet) {
      return res.status(404).json({ message: "Vet profile not found" });
    }
    res.json(vet.services);
  } catch (error) {
    console.error("Get vet services error:", error);
    res.status(500).json({ message: "Server error fetching vet services" });
  }
});

// Add a new service to the vet's profile
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      duration,
      description,
      appointmentRequired,
      isEmergency,
    } = req.body;

    const vet = await Vet.findOne({ userId: req.userId });
    if (!vet) {
      return res.status(404).json({ message: "Vet profile not found" });
    }

    const newService = {
      serviceName: name,
      category,
      price,
      duration,
      description,
      appointmentRequired,
      isEmergency,
    };

    vet.services.push(newService);
    await vet.save();

    res.status(201).json(vet.services[vet.services.length - 1]);
  } catch (error) {
    console.error("Create vet service error:", error);
    res.status(500).json({ message: "Server error creating vet service" });
  }
});

// Update a specific service
router.put("/:serviceId", authenticateToken, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const {
      name,
      category,
      price,
      duration,
      description,
      appointmentRequired,
      isEmergency,
    } = req.body;

    const vet = await Vet.findOne({ userId: req.userId });
    if (!vet) {
      return res.status(404).json({ message: "Vet profile not found" });
    }

    const service = vet.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    service.serviceName = name;
    service.category = category;
    service.price = price;
    service.duration = duration;
    service.description = description;
    service.appointmentRequired = appointmentRequired;
    service.isEmergency = isEmergency;

    await vet.save();
    res.json(service);
  } catch (error) {
    console.error("Update vet service error:", error);
    res.status(500).json({ message: "Server error updating vet service" });
  }
});

// Delete a specific service
router.delete("/:serviceId", authenticateToken, async (req, res) => {
  try {
    const { serviceId } = req.params;

    const vet = await Vet.findOne({ userId: req.userId });
    if (!vet) {
      return res.status(404).json({ message: "Vet profile not found" });
    }

    const service = vet.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    vet.services.pull(serviceId);
    await vet.save();

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete vet service error:", error);
    res.status(500).json({ message: "Server error deleting vet service" });
  }
});

export default router;
