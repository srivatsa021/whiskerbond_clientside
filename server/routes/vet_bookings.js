import express from "express";
import mongoose from "mongoose";
import Vet from "../models/Vet.js";
import BUser from "../models/BUser.js";
import { authenticateToken as authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get all appointments for a specific vet
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find the vet's business account
    const vet = await BUser.findById(userId);
    if (!vet || vet.businessType !== "vet") {
      return res.status(403).json({ message: "Access denied. Only vets can access this resource." });
    }

    // Get query parameters for filtering
    const { status, date, limit = 50 } = req.query;
    
    // Find the vet document with appointments
    const vetData = await Vet.findOne({ userId });

    if (!vetData) {
      return res.json([]);
    }

    let appointments = vetData.appointments || [];

    // Apply filters
    if (status) {
      appointments = appointments.filter(apt => apt.status === status);
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      appointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentTime);
        return aptDate >= startDate && aptDate < endDate;
      });
    }

    // Sort by appointment time
    appointments.sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));

    // Apply limit
    appointments = appointments.slice(0, parseInt(limit));

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching vet appointments:", error);
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
});

// Get upcoming appointments for a vet (next 7 days)
router.get("/upcoming", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const vet = await BUser.findById(userId);
    if (!vet || vet.businessType !== "vet") {
      return res.status(403).json({ message: "Access denied. Only vets can access this resource." });
    }

    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOf7Days = new Date(today);
    endOf7Days.setDate(endOf7Days.getDate() + 7);
    endOf7Days.setHours(23, 59, 59, 999);

    // Find the vet document and filter upcoming appointments (next 7 days)
    const vetData = await Vet.findOne({ userId });

    if (!vetData) {
      return res.json([]);
    }

    const upcomingAppointments = (vetData.appointments || []).filter(apt => {
      const aptDate = new Date(apt.appointmentTime);
      return aptDate >= startOfToday && aptDate <= endOf7Days;
    });

    // Sort by appointment time
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

    // Find the vet document
    const vetData = await Vet.findOne({ userId });

    if (!vetData) {
      return res.status(404).json({ message: "Vet not found" });
    }

    // Find the specific appointment
    const appointment = vetData.appointments.find(apt => apt.appointmentId.toString() === appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Add service details from the services array
    const service = vetData.services.find(svc => svc._id.toString() === appointment.serviceId.toString());
    const appointmentWithService = {
      ...appointment.toObject(),
      serviceDetails: service
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

    // Find and update the appointment
    const vetData = await Vet.findOne({ userId });
    if (!vetData) {
      return res.status(404).json({ message: "Vet not found" });
    }

    const appointment = vetData.appointments.find(apt => apt.appointmentId.toString() === appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await vetData.save();

    res.json(appointment);
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Error updating appointment status", error: error.message });
  }
});

// Complete appointment with diagnosis and prescription
router.patch("/:appointmentId/complete", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.params;
    const { 
      diagnosis, 
      treatment, 
      prescription, 
      followUpRequired, 
      followUpDate 
    } = req.body;

    // Find and update the appointment
    const vetData = await Vet.findOne({ userId });
    if (!vetData) {
      return res.status(404).json({ message: "Vet not found" });
    }

    const appointment = vetData.appointments.find(apt => apt.appointmentId.toString() === appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update completion details
    appointment.status = "completed";
    appointment.completedAt = new Date();
    appointment.diagnosis = diagnosis;
    appointment.treatment = treatment;
    appointment.prescription = prescription;
    appointment.followUpRequired = followUpRequired || false;
    appointment.followUpDate = followUpRequired ? followUpDate : undefined;

    await vetData.save();

    res.json(appointment);
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ message: "Error completing appointment", error: error.message });
  }
});

// Upload document (prescription, receipt, etc.)
router.post("/:appointmentId/documents", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.params;
    const { type, url } = req.body;

    const validTypes = ["prescription", "receipt", "report", "image"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    // Find and update the appointment
    const vetData = await Vet.findOne({ userId });
    if (!vetData) {
      return res.status(404).json({ message: "Vet not found" });
    }

    const appointment = vetData.appointments.find(apt => apt.appointmentId.toString() === appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Add document to the appointment
    appointment.documents.push({
      type,
      url,
      uploadedAt: new Date()
    });

    await vetData.save();

    res.json({ 
      message: "Document uploaded successfully", 
      document: appointment.documents[appointment.documents.length - 1] 
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ message: "Error uploading document", error: error.message });
  }
});

// TEMPORARY ROUTE FOR DEMO - Create sample appointment data
router.post("/create-sample-data", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const vetUser = await BUser.findById(userId);
    if (!vetUser || vetUser.businessType !== "vet") {
      return res.status(403).json({ message: "Access denied. Only vets can access this resource." });
    }

    // Find or create vet document
    let vetData = await Vet.findOne({ userId });
    if (!vetData) {
      vetData = new Vet({ userId, services: [], appointments: [] });
    }

    // Clear existing sample appointments
    vetData.appointments = vetData.appointments.filter(apt => 
      !apt.petParent.includes("Sample") && 
      !["Max Sample", "Luna Sample", "Rocky Sample"].includes(apt.patientName)
    );

    // Create sample services if none exist
    if (vetData.services.length === 0) {
      vetData.services = [
        {
          serviceName: "General Checkup",
          category: "Consultation",
          price: 1500,
          duration: "30 minutes",
          description: "Comprehensive health examination",
          appointmentRequired: true,
          isEmergency: false
        },
        {
          serviceName: "Vaccination",
          category: "Preventive Care",
          price: 800,
          duration: "20 minutes",
          description: "Annual vaccination",
          appointmentRequired: true,
          isEmergency: false
        },
        {
          serviceName: "Orthopedic Consultation",
          category: "Specialist",
          price: 2500,
          duration: "45 minutes",
          description: "Bone and joint examination",
          appointmentRequired: true,
          isEmergency: false
        }
      ];
    }

    // Create sample appointments
    const today = new Date();
    const sampleUserIds = [
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId()
    ];

    const newAppointments = [
      {
        appointmentId: new mongoose.Types.ObjectId(),
        patientId: sampleUserIds[0],
        patientName: "Max Sample",
        petParent: "John Sample Smith",
        serviceId: vetData.services[0]._id,
        serviceName: vetData.services[0].serviceName,
        appointmentTime: new Date(today.setHours(9, 0, 0, 0)),
        status: "confirmed",
        notes: "Annual health checkup and vaccination due",
        symptoms: "None reported",
        isEmergency: false,
        price: vetData.services[0].price,
        duration: vetData.services[0].duration,
        userId: sampleUserIds[0]
      },
      {
        appointmentId: new mongoose.Types.ObjectId(),
        patientId: sampleUserIds[1],
        patientName: "Luna Sample",
        petParent: "Sarah Sample Johnson",
        serviceId: vetData.services[1]._id,
        serviceName: vetData.services[1].serviceName,
        appointmentTime: new Date(today.setHours(11, 30, 0, 0)),
        status: "in_progress",
        notes: "Second dose of annual vaccination required",
        symptoms: "Mild lethargy after first dose",
        isEmergency: false,
        price: vetData.services[1].price,
        duration: vetData.services[1].duration,
        userId: sampleUserIds[1]
      },
      {
        appointmentId: new mongoose.Types.ObjectId(),
        patientId: sampleUserIds[2],
        patientName: "Rocky Sample",
        petParent: "Mike Sample Brown",
        serviceId: vetData.services[2]._id,
        serviceName: vetData.services[2].serviceName,
        appointmentTime: new Date(today.setHours(14, 15, 0, 0)),
        status: "completed",
        notes: "Follow-up for hip surgery recovery, mobility assessment",
        symptoms: "Slight limping, decreased mobility",
        isEmergency: false,
        price: vetData.services[2].price,
        duration: vetData.services[2].duration,
        userId: sampleUserIds[2],
        completedAt: new Date(),
        diagnosis: "Hip joint healing well, minor arthritis detected",
        treatment: "Prescribed anti-inflammatory medication and physiotherapy exercises",
        prescription: {
          medications: [
            {
              name: "Rimadyl",
              dosage: "25mg",
              frequency: "Twice daily",
              duration: "14 days"
            }
          ],
          instructions: "Give with food. Monitor for any digestive issues. Continue prescribed exercises."
        },
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        documents: [
          {
            type: "prescription",
            url: "https://example.com/prescription_rocky_123.pdf",
            uploadedAt: new Date()
          },
          {
            type: "report",
            url: "https://example.com/orthopedic_report_rocky_123.pdf",
            uploadedAt: new Date()
          }
        ]
      }
    ];

    vetData.appointments.push(...newAppointments);
    await vetData.save();

    res.json({
      message: "Sample appointment data created successfully",
      services: vetData.services.length,
      appointments: newAppointments.length,
      appointmentDetails: newAppointments.map(apt => ({
        patientName: apt.patientName,
        time: apt.appointmentTime,
        status: apt.status,
        serviceName: apt.serviceName
      }))
    });

  } catch (error) {
    console.error("Error creating sample data:", error);
    res.status(500).json({ message: "Error creating sample data", error: error.message });
  }
});

export default router;
