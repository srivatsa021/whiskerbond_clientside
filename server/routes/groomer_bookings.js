import express from "express";
import mongoose from "mongoose";
import Groomer from "../models/Groomer.js";
import BUser from "../models/BUser.js";
import { authenticateToken as authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get all appointments for a specific groomer
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const groomerUser = await BUser.findById(userId);
    if (!groomerUser || groomerUser.businessType !== "groomer") {
      return res.status(403).json({ message: "Access denied. Only groomers can access this resource." });
    }

    const { status, date, limit = 50 } = req.query;

    const groomerData = await Groomer.findOne({ userId });
    if (!groomerData) {
      return res.json([]);
    }

    let appointments = groomerData.appointments || [];

    if (status) {
      appointments = appointments.filter((apt) => apt.status === status);
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      appointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.appointmentTime);
        return aptDate >= startDate && aptDate < endDate;
      });
    }

    appointments.sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
    appointments = appointments.slice(0, parseInt(limit));

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching groomer appointments:", error);
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
});

// Get upcoming appointments for a groomer (next 7 days)
router.get("/upcoming", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const groomerUser = await BUser.findById(userId);
    if (!groomerUser || groomerUser.businessType !== "groomer") {
      return res.status(403).json({ message: "Access denied. Only groomers can access this resource." });
    }

    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOf7Days = new Date(today);
    endOf7Days.setDate(endOf7Days.getDate() + 7);
    endOf7Days.setHours(23, 59, 59, 999);

    const groomerData = await Groomer.findOne({ userId });
    if (!groomerData) {
      return res.json([]);
    }

    const upcomingAppointments = (groomerData.appointments || []).filter((apt) => {
      const aptDate = new Date(apt.appointmentTime);
      return aptDate >= startOfToday && aptDate <= endOf7Days;
    });

    upcomingAppointments.sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));

    res.json(upcomingAppointments);
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    res.status(500).json({ message: "Error fetching upcoming appointments", error: error.message });
  }
});

// Get specific appointment details
router.get("/:appointmentId", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.params;

    const groomerData = await Groomer.findOne({ userId });
    if (!groomerData) {
      return res.status(404).json({ message: "Groomer not found" });
    }

    const appointment = groomerData.appointments.find((apt) => apt.appointmentId.toString() === appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const service = groomerData.services.find((svc) => svc._id.toString() === appointment.serviceId.toString());
    const appointmentWithService = {
      ...appointment.toObject(),
      serviceDetails: service,
    };

    res.json(appointmentWithService);
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    res.status(500).json({ message: "Error fetching appointment details", error: error.message });
  }
});

// Update appointment status
router.patch("/:appointmentId/status", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.params;
    const { status } = req.body;

    const validStatuses = ["scheduled", "confirmed", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const groomerData = await Groomer.findOne({ userId });
    if (!groomerData) {
      return res.status(404).json({ message: "Groomer not found" });
    }

    const appointment = groomerData.appointments.find((apt) => apt.appointmentId.toString() === appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    if (status === "completed") {
      appointment.completedAt = new Date();
    }

    await groomerData.save();

    res.json(appointment);
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Error updating appointment status", error: error.message });
  }
});

// Complete appointment (mark as completed and optionally add notes)
router.patch("/:appointmentId/complete", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.params;
    const { notes } = req.body;

    const groomerData = await Groomer.findOne({ userId });
    if (!groomerData) {
      return res.status(404).json({ message: "Groomer not found" });
    }

    const appointment = groomerData.appointments.find((apt) => apt.appointmentId.toString() === appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "completed";
    appointment.completedAt = new Date();
    if (typeof notes === "string" && notes.trim().length > 0) {
      appointment.notes = notes.trim();
    }

    await groomerData.save();

    res.json(appointment);
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ message: "Error completing appointment", error: error.message });
  }
});

// Upload document (receipt, report, image)
router.post("/:appointmentId/documents", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.params;
    const { type, url } = req.body;

    const validTypes = ["receipt", "report", "image"]; // subset relevant for groomers
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    const groomerData = await Groomer.findOne({ userId });
    if (!groomerData) {
      return res.status(404).json({ message: "Groomer not found" });
    }

    const appointment = groomerData.appointments.find((apt) => apt.appointmentId.toString() === appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.documents.push({ type, url, uploadedAt: new Date() });
    await groomerData.save();

    res.json({
      message: "Document uploaded successfully",
      document: appointment.documents[appointment.documents.length - 1],
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ message: "Error uploading document", error: error.message });
  }
});

// TEMPORARY ROUTE FOR DEMO - Create sample appointment data for groomers
router.post("/create-sample-data", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const groomerUser = await BUser.findById(userId);
    if (!groomerUser || groomerUser.businessType !== "groomer") {
      return res.status(403).json({ message: "Access denied. Only groomers can access this resource." });
    }

    // Find or create groomer document
    let groomerData = await Groomer.findOne({ userId });
    if (!groomerData) {
      groomerData = new Groomer({ userId, services: [], appointments: [] });
    }

    // Clear existing sample appointments
    groomerData.appointments = groomerData.appointments.filter(
      (apt) => !apt.petParent.includes("Sample") && !["Buddy Sample", "Bella Sample", "Charlie Sample"].includes(apt.patientName)
    );

    // Create sample services if none exist
    if (groomerData.services.length === 0) {
      groomerData.services = [
        {
          serviceName: "Bath & Brush",
          price: 600,
          duration: "30 minutes",
          description: "Bath with gentle shampoo and brush out",
          appointmentRequired: true,
        },
        {
          serviceName: "Full Grooming",
          price: 1500,
          duration: "60 minutes",
          description: "Bath, haircut, nail trim, ear cleaning",
          appointmentRequired: true,
        },
        {
          serviceName: "Nail Trim",
          price: 300,
          duration: "15 minutes",
          description: "Nail clipping and filing",
          appointmentRequired: true,
        },
      ];
    }

    const today = new Date();
    const sampleUserIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

    const newAppointments = [
      {
        appointmentId: new mongoose.Types.ObjectId(),
        patientId: sampleUserIds[0],
        patientName: "Buddy Sample",
        petParent: "Alice Sample",
        serviceId: groomerData.services[0]._id,
        serviceName: groomerData.services[0].serviceName,
        appointmentTime: new Date(new Date().setHours(10, 0, 0, 0)),
        status: "confirmed",
        notes: "Sensitive skin - use hypoallergenic shampoo",
        price: groomerData.services[0].price,
        duration: groomerData.services[0].duration,
        userId: sampleUserIds[0],
      },
      {
        appointmentId: new mongoose.Types.ObjectId(),
        patientId: sampleUserIds[1],
        patientName: "Bella Sample",
        petParent: "Bob Sample",
        serviceId: groomerData.services[1]._id,
        serviceName: groomerData.services[1].serviceName,
        appointmentTime: new Date(new Date().setHours(12, 30, 0, 0)),
        status: "in_progress",
        notes: "Matting on hind legs",
        price: groomerData.services[1].price,
        duration: groomerData.services[1].duration,
        userId: sampleUserIds[1],
      },
      {
        appointmentId: new mongoose.Types.ObjectId(),
        patientId: sampleUserIds[2],
        patientName: "Charlie Sample",
        petParent: "Carol Sample",
        serviceId: groomerData.services[2]._id,
        serviceName: groomerData.services[2].serviceName,
        appointmentTime: new Date(new Date().setHours(15, 15, 0, 0)),
        status: "completed",
        notes: "Very calm, gave treats after trim",
        price: groomerData.services[2].price,
        duration: groomerData.services[2].duration,
        userId: sampleUserIds[2],
        completedAt: new Date(),
        documents: [
          { type: "receipt", url: "https://example.com/receipt_charlie_123.pdf", uploadedAt: new Date() },
        ],
      },
    ];

    groomerData.appointments.push(...newAppointments);
    await groomerData.save();

    res.json({
      message: "Sample appointment data created successfully",
      services: groomerData.services.length,
      appointments: newAppointments.length,
      appointmentDetails: newAppointments.map((apt) => ({
        patientName: apt.patientName,
        time: apt.appointmentTime,
        status: apt.status,
        serviceName: apt.serviceName,
      })),
    });
  } catch (error) {
    console.error("Error creating sample data:", error);
    res.status(500).json({ message: "Error creating sample data", error: error.message });
  }
});

export default router;
