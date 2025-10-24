import express from "express";
import mongoose from "mongoose";
import Trainer from "../models/Trainer.js";
import { authenticateToken as authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /api/trainers/:userId/appointments
// Fetch all appointments for a trainer by userId or trainer _id
router.get("/:userId/appointments", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    // allow trainers to fetch only their own data unless admin later
    if (req.userId !== userId && req.userId !== undefined && req.userId !== null) {
      // if the authenticated user isn't the requested user, deny
      if (req.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Try find by userId first, then by _id
    let trainer = await Trainer.findOne({ userId });
    if (!trainer) {
      // if not found by userId, check by _id
      try {
        if (mongoose.Types.ObjectId.isValid(userId)) {
          trainer = await Trainer.findById(userId);
        }
      } catch (e) {}
    }

    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    const appointments = trainer.appointments || [];
    // small normalization for client consumption
    const sanitized = (appointments || []).map((a) => {
      const out = JSON.parse(JSON.stringify(a));
      // make appointmentId a string
      if (out.appointmentId && out.appointmentId.toString) out.appointmentId = out.appointmentId.toString();
      return out;
    });

    return res.json(sanitized);
  } catch (error) {
    console.error("Error in GET /api/trainers/:userId/appointments", error);
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
});

// PUT /api/trainers/:trainerId/appointments/:appointmentId/session/:day
// Update a particular session (day) inside an appointment
router.put("/:trainerId/appointments/:appointmentId/session/:day", authMiddleware, async (req, res) => {
  try {
    const { trainerId, appointmentId, day } = req.params;
    const { status, progressNotes } = req.body;

    const validStatuses = ["pending", "completed", "missed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // find trainer by userId or _id
    let trainer = await Trainer.findOne({ userId: trainerId });
    if (!trainer && mongoose.Types.ObjectId.isValid(trainerId)) {
      trainer = await Trainer.findById(trainerId);
    }
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    const appointment = (trainer.appointments || []).find((apt) => apt.appointmentId && apt.appointmentId.toString && apt.appointmentId.toString() === appointmentId.toString());
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const dayNum = parseInt(day, 10);
    if (Number.isNaN(dayNum) || dayNum < 1) return res.status(400).json({ message: "Invalid day parameter" });

    // Determine sessions array (prefer trainingPlan.sessionDates -> sessionDates -> dayWiseStatus)
    let sessions = null;
    if (appointment.trainingPlan && Array.isArray(appointment.trainingPlan.sessionDates) && appointment.trainingPlan.sessionDates.length > 0) {
      sessions = appointment.trainingPlan.sessionDates;
    } else if (Array.isArray(appointment.sessionDates) && appointment.sessionDates.length > 0) {
      sessions = appointment.sessionDates;
    } else if (Array.isArray(appointment.dayWiseStatus) && appointment.dayWiseStatus.length > 0) {
      sessions = appointment.dayWiseStatus;
    }

    if (!sessions) return res.status(400).json({ message: "No session data available for this appointment" });

    const idx = dayNum - 1;
    if (idx < 0 || idx >= sessions.length) return res.status(400).json({ message: "Day out of range" });

    // Update fields
    if (status) sessions[idx].status = status;
    if (progressNotes !== undefined) sessions[idx].progressNotes = progressNotes;

    // Recompute appointment overall status
    const flatSessions = sessions.map((s) => (s.status ? s.status : (s.status === undefined ? "pending" : s)));
    const allCompleted = flatSessions.length > 0 && flatSessions.every((s) => s === "completed");
    const anyCompleted = flatSessions.some((s) => s === "completed");
    if (allCompleted) appointment.status = "completed";
    else if (anyCompleted) appointment.status = "in_progress";
    else appointment.status = "pending";

    // Persist changes carefully to avoid validation issues: find index and update subfields
    try {
      const aptIndex = trainer.appointments.findIndex((a) => a.appointmentId && a.appointmentId.toString && a.appointmentId.toString() === appointmentId.toString());
      if (aptIndex === -1) throw new Error("Appointment index not found");

      const updateObj = {};
      // prefer updating trainingPlan.sessionDates if present
      if (appointment.trainingPlan && Array.isArray(appointment.trainingPlan.sessionDates) && appointment.trainingPlan.sessionDates.length > 0) {
        updateObj[`appointments.${aptIndex}.trainingPlan.sessionDates`] = appointment.trainingPlan.sessionDates;
      } else if (Array.isArray(appointment.sessionDates) && appointment.sessionDates.length > 0) {
        updateObj[`appointments.${aptIndex}.sessionDates`] = appointment.sessionDates;
      } else {
        updateObj[`appointments.${aptIndex}.dayWiseStatus`] = appointment.dayWiseStatus;
      }
      updateObj[`appointments.${aptIndex}.status`] = appointment.status;
      updateObj.updatedAt = new Date();

      await Trainer.updateOne({ _id: trainer._id }, { $set: updateObj }, { runValidators: false });
    } catch (e) {
      // fallback to save entire doc
      console.warn("Failed partial update, falling back to save:", e.message);
      await trainer.save();
    }

    // Respond with fresh appointment
    try {
      const fresh = await Trainer.findOne({ _id: trainer._id }, { appointments: { $elemMatch: { appointmentId: appointment.appointmentId } } });
      const freshApt = fresh && fresh.appointments && fresh.appointments[0] ? fresh.appointments[0] : appointment;
      return res.json(freshApt);
    } catch (e) {
      return res.json(appointment);
    }
  } catch (error) {
    console.error("Error in PUT /api/trainers/:trainerId/appointments/:appointmentId/session/:day", error);
    res.status(500).json({ message: "Error updating session", error: error.message });
  }
});

export default router;
