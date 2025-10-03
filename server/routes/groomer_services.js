import express from "express";
import Groomer from "../models/Groomer.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get all services for the authenticated groomer
router.get("/", authenticateToken, async (req, res) => {
  try {
    let groomer = await Groomer.findOne({ userId: req.userId });
    if (!groomer) {
      groomer = await Groomer.create({ userId: req.userId });
    }
    res.json(groomer.services);
  } catch (error) {
    console.error("Get groomer services error:", error);
    res.status(500).json({ message: "Server error fetching groomer services" });
  }
});

// Add a new service to the groomer's profile
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, price, duration, description, appointmentRequired } = req.body;

    let groomer = await Groomer.findOne({ userId: req.userId });
    if (!groomer) {
      groomer = await Groomer.create({ userId: req.userId });
    }

    const newService = {
      serviceName: name,
      price,
      duration,
      description,
      appointmentRequired,
    };

    groomer.services.push(newService);
    await groomer.save();

    res.status(201).json(groomer.services[groomer.services.length - 1]);
  } catch (error) {
    console.error("Create groomer service error:", error);
    res.status(500).json({ message: "Server error creating groomer service" });
  }
});

// Update a specific service
router.put("/:serviceId", authenticateToken, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, price, duration, description, appointmentRequired } = req.body;

    let groomer = await Groomer.findOne({ userId: req.userId });
    if (!groomer) {
      groomer = await Groomer.create({ userId: req.userId });
    }

    const service = groomer.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    service.serviceName = name;
    service.price = price;
    service.duration = duration;
    service.description = description;
    service.appointmentRequired = appointmentRequired;

    await groomer.save();
    res.json(service);
  } catch (error) {
    console.error("Update groomer service error:", error);
    res.status(500).json({ message: "Server error updating groomer service" });
  }
});

// Delete a specific service
router.delete("/:serviceId", authenticateToken, async (req, res) => {
  try {
    const { serviceId } = req.params;

    let groomer = await Groomer.findOne({ userId: req.userId });
    if (!groomer) {
      groomer = await Groomer.create({ userId: req.userId });
    }

    const service = groomer.services.id(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    groomer.services.pull(serviceId);
    await groomer.save();

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete groomer service error:", error);
    res.status(500).json({ message: "Server error deleting groomer service" });
  }
});

export default router;
