import express from "express";
import mongoose from "mongoose";
import Trainer from "../models/Trainer.js";
import BUser from "../models/BUser.js";
import { authenticateToken as authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Helpers
const parseTimeOfDay = (timeOfDay) => {
  if (!timeOfDay) return { hours: 9, minutes: 0 };
  const [h, m] = timeOfDay.split(":").map((v) => parseInt(v, 10));
  return { hours: isNaN(h) ? 9 : h, minutes: isNaN(m) ? 0 : m };
};

const addTime = (date, { hours, minutes }) => {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

const isWeekend = (d) => {
  const day = d.getDay();
  return day === 0 || day === 6;
};

const nextWeekday = (d) => {
  const date = new Date(d);
  while (isWeekend(date)) {
    date.setDate(date.getDate() + 1);
  }
  return date;
};

// Normalize appointment for API output
const normalizeAppointmentOutput = (apt) => {
  if (!apt) return apt;
  const out = { ...apt.toObject ? apt.toObject() : JSON.parse(JSON.stringify(apt)) };
  // appointmentId as string
  try {
    if (out.appointmentId && out.appointmentId.toString) out.appointmentId = out.appointmentId.toString();
  } catch (e) {}
  // normalize sessionDates to ISO strings
  if (Array.isArray(out.sessionDates)) {
    out.sessionDates = out.sessionDates.map((d) => (d ? new Date(d).toISOString() : d));
  }
  // normalize dayWiseStatus dates
  if (Array.isArray(out.dayWiseStatus)) {
    out.dayWiseStatus = out.dayWiseStatus.map((s) => ({
      ...s,
      date: s.date ? new Date(s.date).toISOString() : s.date,
      progressNotes: s.progressNotes || "",
      status: s.status || "pending",
    }));
  }
  // normalize trainingPlan.sessionDates if present and expose as dayWiseStatus (response-only)
  if (out.trainingPlan && Array.isArray(out.trainingPlan.sessionDates)) {
    out.trainingPlan.sessionDates = out.trainingPlan.sessionDates.map((sd) => ({
      day: sd.day,
      date: sd.date || (sd.dateTime ? new Date(sd.dateTime).toISOString().split("T")[0] : sd.date),
      time: sd.time || out.trainingPlan.sessionTime || out.dailyVisitTime || "",
      dateTime: sd.dateTime ? new Date(sd.dateTime).toISOString() : (sd.date ? new Date(sd.date).toISOString() : sd.dateTime),
      status: sd.status || "pending",
      progressNotes: sd.progressNotes || "",
    }));

    // Expose a response-only dayWiseStatus array derived from the trainingPlan.sessionDates so UI can render
    out.dayWiseStatus = out.trainingPlan.sessionDates.map((sd) => ({
      date: sd.dateTime ? new Date(sd.dateTime).toISOString() : (sd.date ? new Date(sd.date).toISOString() : sd.date),
      status: sd.status || "pending",
      progressNotes: sd.progressNotes || "",
    }));
  }

  // ensure petName/clientName are populated from legacy fields
  if (!out.petName && out.patientName) out.petName = out.patientName;
  if (!out.clientName && out.clientName !== undefined) out.clientName = out.clientName; // preserve if exists
  if (!out.clientName && out.petParent) out.clientName = out.petParent;

  // ensure appointmentTime is derived from sessionDates if present
  if ((!out.appointmentTime || out.appointmentTime === null) && Array.isArray(out.sessionDates) && out.sessionDates.length > 0) {
    out.appointmentTime = out.sessionDates[0];
  } else if (out.appointmentTime) {
    out.appointmentTime = new Date(out.appointmentTime).toISOString();
  }
  return out;
};


const parseDuration = (duration) => {
  if (typeof duration === "number") return { weeks: 0, days: duration };
  if (typeof duration === "string") {
    const match = duration.toLowerCase().match(/(\d+)\s*(day|days|week|weeks)/);
    if (match) {
      const qty = parseInt(match[1], 10);
      const unit = match[2];
      if (unit.startsWith("week")) return { weeks: qty, days: 0 };
      return { weeks: 0, days: qty };
    }
  }
  return { weeks: 0, days: 5 };
};

const generateSessions = ({ tier, startDate, timeOfDay, customDuration, frequency, daysPerWeek }) => {
  const { hours, minutes } = parseTimeOfDay(timeOfDay);
  const start = new Date(startDate);
  let sessions = [];

  if (tier === "tier1") {
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      sessions.push(addTime(d, { hours, minutes }));
    }
  } else if (tier === "tier2") {
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i * 2);
      sessions.push(addTime(d, { hours, minutes }));
    }
  } else if (tier === "tier3") {
    let count = 0;
    let d = nextWeekday(start);
    while (count < 15) {
      if (!isWeekend(d)) {
        sessions.push(addTime(d, { hours, minutes }));
        count++;
      }
      d = new Date(d);
      d.setDate(d.getDate() + 1);
    }
  } else {
    const { weeks, days } = parseDuration(customDuration);

    if (frequency === "daily") {
      const total = weeks > 0 ? weeks * 7 : days;
      for (let i = 0; i < total; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        sessions.push(addTime(d, { hours, minutes }));
      }
    } else if (frequency === "alternate") {
      const totalSessions = weeks > 0 ? Math.ceil((weeks * 14) / 2) : Math.ceil(days / 2);
      for (let i = 0; i < totalSessions; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i * 2);
        sessions.push(addTime(d, { hours, minutes }));
      }
    } else if (frequency === "days_per_week") {
      const n = Math.min(Math.max(Number(daysPerWeek) || 1, 1), 6);
      let totalWeeks = weeks || 0;
      let remainingDays = days || 0;
      if (totalWeeks === 0 && remainingDays > 0) {
        totalWeeks = Math.ceil(remainingDays / n);
        remainingDays = 0;
      }
      // iterate weeks
      let d = new Date(start);
      for (let w = 0; w < totalWeeks; w++) {
        let added = 0;
        let cursor = new Date(d);
        // move cursor to Monday for each week window
        while (cursor.getDay() !== 1) {
          cursor.setDate(cursor.getDate() - 1);
        }
        // add n weekdays this week
        let dayCursor = new Date(cursor);
        while (added < n) {
          if (!isWeekend(dayCursor) && dayCursor >= d) {
            sessions.push(addTime(dayCursor, { hours, minutes }));
            added++;
          }
          dayCursor.setDate(dayCursor.getDate() + 1);
        }
        // advance to next week start
        d.setDate(d.getDate() + 7);
      }
    } else {
      // fallback: consecutive days
      const total = weeks > 0 ? weeks * 5 : days;
      for (let i = 0; i < total; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        sessions.push(addTime(d, { hours, minutes }));
      }
    }
  }
  return sessions;
};

// Get all appointments for a trainer
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await BUser.findById(userId);
    if (!user || user.businessType !== "trainer") {
      return res.status(403).json({ message: "Access denied. Only trainers can access this resource." });
    }

    const { status, date, limit = 50 } = req.query;

    const trainerData = await Trainer.findOne({ userId });
    if (!trainerData) return res.json([]);

    let appointments = trainerData.appointments || [];

    // Normalize appointments to handle legacy inconsistencies:
    // - serviceId may be a string like "1"; attempt to resolve using service._id by matching serviceName
    // - some legacy entries duplicated session dates under trainingPlans; prefer appointment.dayWiseStatus when present
    const servicesByName = {};
    for (const s of trainerData.services || []) {
      if (s.serviceName) servicesByName[s.serviceName] = s;
    }

    for (const apt of appointments) {
      // ensure serviceId is ObjectId when possible
      if (apt.serviceId && typeof apt.serviceId === "string") {
        // try matching by exact _id string
        try {
          const candidate = trainerData.services.find((svc) => svc._id && svc._id.toString() === apt.serviceId);
          if (candidate) {
            // persist fix
            await Trainer.updateOne(
              { _id: trainerData._id, "appointments.appointmentId": apt.appointmentId },
              { $set: { "appointments.$.serviceId": candidate._id } },
              { runValidators: false }
            );
            apt.serviceId = candidate._id;
          } else if (apt.serviceName && servicesByName[apt.serviceName]) {
            const candidate2 = servicesByName[apt.serviceName];
            await Trainer.updateOne(
              { _id: trainerData._id, "appointments.appointmentId": apt.appointmentId },
              { $set: { "appointments.$.serviceId": candidate2._id } },
              { runValidators: false }
            );
            apt.serviceId = candidate2._id;
          }
        } catch (e) {
          console.warn("Failed to normalize serviceId for appointment", apt.appointmentId, e.message);
        }
      }

    }

    if (status) {
      appointments = appointments.filter((apt) => apt.status === status);
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      appointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.appointmentTime || apt.startDate);
        return aptDate >= startDate && aptDate < endDate;
      });
    }

    appointments.sort((a, b) => new Date(a.appointmentTime || a.startDate) - new Date(b.appointmentTime || b.startDate));
    appointments = appointments.slice(0, parseInt(limit));

    // return normalized output
    const out = appointments.map((a) => normalizeAppointmentOutput(a));
    return res.json(out);
  } catch (error) {
    console.error("Error fetching trainer appointments:", error);
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
});

// Create a new appointment with auto-generated sessions
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // trainer
    const user = await BUser.findById(userId);
    if (!user || user.businessType !== "trainer") {
      return res.status(403).json({ message: "Access denied. Only trainers can create this resource." });
    }

    const { serviceId, startDate, timeOfDay, ownerId, petId, clientName, petName } = req.body;
    if (!serviceId || !startDate) {
      return res.status(400).json({ message: "serviceId and startDate are required" });
    }

    const trainerData = await Trainer.findOne({ userId });
    if (!trainerData) return res.status(404).json({ message: "Trainer not found" });

    const service = trainerData.services.id(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const sessions = generateSessions({
      tier: service.tier,
      startDate,
      timeOfDay,
      customDuration: service.duration,
      frequency: service.frequency,
      daysPerWeek: service.daysPerWeek,
    });

    const appointment = {
      clientId: ownerId || null,
      ownerId: ownerId || null,
      petId: petId || null,
      trainerId: userId,
      clientName: clientName || undefined,
      petName: petName || undefined,
      serviceId: service._id,
      serviceName: service.serviceName,
      tier: service.tier,
      startDate: new Date(startDate),
      sessionDates: sessions,
      dayWiseStatus: sessions.map((d) => ({ date: d, status: "pending" })),
      timeOfDay: timeOfDay || undefined,
      appointmentTime: sessions[0],
      status: "pending",
      price: service.price,
      duration: service.duration,
    };

    trainerData.appointments.push(appointment);
    await trainerData.save();

    res.status(201).json(trainerData.appointments[trainerData.appointments.length - 1]);
  } catch (error) {
    console.error("Error creating trainer appointment:", error);
    res.status(500).json({ message: "Error creating appointment", error: error.message });
  }
});

// Get a specific appointment
router.get("/:appointmentId", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.params;

    const trainerData = await Trainer.findOne({ userId });
    if (!trainerData) return res.status(404).json({ message: "Trainer not found" });

    const appointment = trainerData.appointments.find((apt) => apt.appointmentId.toString() === appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Backfill dayWiseStatus in-memory only (do not persist) using trainingPlan.sessionDates if available,
  // otherwise generate sessions for response. This keeps DB authoritative training plans untouched.
  if ((!appointment.dayWiseStatus || appointment.dayWiseStatus.length === 0) && appointment.trainingPlan && Array.isArray(appointment.trainingPlan.sessionDates) && appointment.trainingPlan.sessionDates.length > 0) {
    const dayWise = appointment.trainingPlan.sessionDates.map((sd) => ({
      date: sd.dateTime ? new Date(sd.dateTime) : (sd.date ? new Date(sd.date) : null),
      status: sd.status || "pending",
      progressNotes: sd.progressNotes || "",
    }));
    appointment.dayWiseStatus = dayWise;
    appointment.sessionDates = appointment.trainingPlan.sessionDates.map((sd) => (sd.dateTime ? new Date(sd.dateTime) : (sd.date ? new Date(sd.date) : null)));
  } else if (!appointment.dayWiseStatus || appointment.dayWiseStatus.length === 0) {
    const service = trainerData.services.find((svc) =>
      appointment.serviceId && svc._id.toString() === (appointment.serviceId && appointment.serviceId.toString ? appointment.serviceId.toString() : appointment.serviceId)
    );

    const sessions = generateSessions({
      tier: appointment.tier || service?.tier || "custom",
      startDate: appointment.appointmentTime || appointment.startDate || new Date(),
      timeOfDay: appointment.timeOfDay,
      customDuration: appointment.duration || service?.duration || 7,
      frequency: service?.frequency || "daily",
      daysPerWeek: service?.daysPerWeek,
    });

    const dayWise = sessions.map((d) => ({ date: d, status: "pending", progressNotes: "" }));
    appointment.dayWiseStatus = dayWise;
    appointment.sessionDates = sessions;
  }

    const service = trainerData.services.find((svc) => appointment.serviceId && svc._id.toString && svc._id.toString() === (appointment.serviceId && appointment.serviceId.toString ? appointment.serviceId.toString() : appointment.serviceId));
    const normalized = normalizeAppointmentOutput(appointment);
    normalized.serviceDetails = service;
    res.json(normalized);
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    res.status(500).json({ message: "Error fetching appointment details", error: error.message });
  }
});

// Update appointment status (overall)
router.patch("/:appointmentId/status", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const trainerData = await Trainer.findOne({ userId });
    if (!trainerData) return res.status(404).json({ message: "Trainer not found" });

    const appointment = trainerData.appointments.find((apt) => apt.appointmentId.toString() === appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = status;
    if (status === "in_progress" && !appointment.acceptedAt) {
      appointment.acceptedAt = new Date();
    }
    if (status === "completed") {
      appointment.completedAt = new Date();
    }

    // Persist only the modified appointment fields to avoid validation issues on legacy data
    try {
      const aptIndex = trainerData.appointments.findIndex((a) => a.appointmentId && a.appointmentId.toString && a.appointmentId.toString() === appointmentId.toString());
      if (aptIndex === -1) throw new Error("Appointment index not found for persistence");
      const updateObj = {};
      updateObj[`appointments.${aptIndex}.status`] = appointment.status;
      if (appointment.acceptedAt) updateObj[`appointments.${aptIndex}.acceptedAt`] = appointment.acceptedAt;
      if (appointment.completedAt) updateObj[`appointments.${aptIndex}.completedAt`] = appointment.completedAt;

      updateObj.updatedAt = new Date();
      await Trainer.updateOne(
        { _id: trainerData._id },
        { $set: updateObj },
        { runValidators: false }
      );
    } catch (e) {
      console.warn("Failed to persist appointment status update via updateOne, falling back to save:", e.message);
      await trainerData.save();
    }

    // Return normalized appointment
    try {
      const fresh = await Trainer.findOne({ _id: trainerData._id }, { appointments: { $elemMatch: { appointmentId: appointment.appointmentId } } });
      const freshApt = fresh && fresh.appointments && fresh.appointments[0] ? fresh.appointments[0] : appointment;
      return res.json(normalizeAppointmentOutput(freshApt));
    } catch (e) {
      return res.json(normalizeAppointmentOutput(appointment));
    }
  } catch (error) {
    console.error("Error updating trainer appointment status:", error);
    res.status(500).json({ message: "Error updating appointment status", error: error.message });
  }
});

// Update a specific session's status (Day X)
router.patch("/:appointmentId/sessions/:index", authMiddleware, async (req, res) => {
  console.log('PATCH /trainer-bookings/:appointmentId/sessions/:index called', { params: req.params, body: req.body });
  try {
    const userId = req.userId;
    const { appointmentId, index } = req.params;
    const { status, progressNotes } = req.body; // "completed" or "missed" or "pending"

    const validStatuses = ["pending", "completed", "missed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid session status" });
    }

    const trainerData = await Trainer.findOne({ userId });
    if (!trainerData) return res.status(404).json({ message: "Trainer not found" });

    const appointment = trainerData.appointments.find((apt) => apt.appointmentId.toString() === appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const idx = parseInt(index, 10);

    // Debug info
    console.log(`PATCH session update request: appointmentId=${appointmentId}, idxParam=${index}, parsedIdx=${idx}`);

    // Normalize small legacy inconsistencies in-memory
    if (!appointment.clientId && appointment.ownerId) appointment.clientId = appointment.ownerId;
    if (!appointment.clientId && appointment.userId) appointment.clientId = appointment.userId;
    if (appointment.status === "in-progress") appointment.status = "in_progress";

    // Determine the sessions array we will update: prefer appointment.dayWiseStatus (legacy) else trainingPlan.sessionDates
    let sessionsArray = null;
    if (Array.isArray(appointment.dayWiseStatus) && appointment.dayWiseStatus.length > 0) {
      sessionsArray = appointment.dayWiseStatus;
      console.log(`Using appointment.dayWiseStatus with length=${sessionsArray.length}`);
    } else if (appointment.trainingPlan && Array.isArray(appointment.trainingPlan.sessionDates) && appointment.trainingPlan.sessionDates.length > 0) {
      // shallow clone so we can mutate safely
      sessionsArray = appointment.trainingPlan.sessionDates.map((sd) => ({
        date: sd.dateTime ? sd.dateTime : (sd.date ? sd.date : null),
        status: sd.status || "pending",
        progressNotes: sd.progressNotes || "",
      }));
      console.log(`Using appointment.trainingPlan.sessionDates with length=${sessionsArray.length}`);
    } else if (Array.isArray(appointment.sessionDates) && appointment.sessionDates.length > 0) {
      // support older shape where sessionDates exist at the appointment root
      sessionsArray = appointment.sessionDates.map((sd) => ({
        date: sd.dateTime ? sd.dateTime : (sd.date ? sd.date : null),
        status: sd.status || (sd && sd.status) || "pending",
        progressNotes: sd.progressNotes || sd.progressNotes || "",
      }));
      console.log(`Using appointment.sessionDates with length=${sessionsArray.length}`);
    } else {
      console.log('No sessions source found for appointment');
    }

    console.log('Built sessionsArray length=', sessionsArray ? sessionsArray.length : 0, 'idx=', idx, 'sessionsArray sample=', sessionsArray && sessionsArray.slice ? sessionsArray.slice(0,5) : sessionsArray);
    if (Number.isNaN(idx)) {
      console.warn(`Invalid index param provided: ${index}`);
      return res.status(400).json({ message: "Invalid session index parameter" });
    }

    if (!sessionsArray || idx < 0 || idx >= sessionsArray.length) {
      console.warn(`Session index ${idx} out of bounds (sessions length: ${sessionsArray ? sessionsArray.length : 0})`);
      return res.status(400).json({ message: "Invalid session index" });
    }

    // Update the in-memory session status and notes
    sessionsArray[idx].status = status;
    if (progressNotes !== undefined) sessionsArray[idx].progressNotes = progressNotes;

    // Reflect back into appointment object: prefer updating embedded trainingPlan.sessionDates if exists
    if (appointment.trainingPlan && Array.isArray(appointment.trainingPlan.sessionDates) && appointment.trainingPlan.sessionDates.length > 0) {
      // ensure fields preserved and add progressNotes
      appointment.trainingPlan.sessionDates = appointment.trainingPlan.sessionDates.map((sd, i) => ({
        day: sd && sd.day !== undefined ? sd.day : i + 1,
        date: sd && sd.date,
        time: sd && sd.time,
        dateTime: sd && sd.dateTime,
        status: i === idx ? status : (sd && sd.status) || "pending",
        progressNotes: i === idx ? (progressNotes !== undefined ? progressNotes : (sd && sd.progressNotes) || "") : (sd && sd.progressNotes) || "",
      }));
    } else {
      // fallback: keep appointment.dayWiseStatus
      appointment.dayWiseStatus = sessionsArray;
    }

    // Recompute overall status based on sessionsArray
    const allCompleted = sessionsArray.length > 0 && sessionsArray.every((s) => s.status === "completed");
    const anyCompleted = sessionsArray.some((s) => s.status === "completed");
    if (allCompleted) appointment.status = "completed";
    else if (anyCompleted) appointment.status = "in_progress";
    else appointment.status = "pending";

    // Prepare safe values for persistence: convert any date-like entries to real Dates
    const persistedDayWise = (appointment.trainingPlan && Array.isArray(appointment.trainingPlan.sessionDates) && appointment.trainingPlan.sessionDates.length > 0)
      ? appointment.trainingPlan.sessionDates.map((sd) => ({
          date: sd.dateTime ? new Date(sd.dateTime) : (sd.date ? new Date(sd.date) : new Date()),
          status: sd.status || "pending",
          progressNotes: sd.progressNotes || "",
        }))
      : (Array.isArray(appointment.sessionDates) && appointment.sessionDates.length > 0)
      ? appointment.sessionDates.map((sd) => ({
          date: sd && sd.dateTime ? new Date(sd.dateTime) : (sd && sd.date ? new Date(sd.date) : (typeof sd === 'string' || sd instanceof Date ? new Date(sd) : new Date())),
          status: sd && sd.status ? sd.status : "pending",
          progressNotes: sd && sd.progressNotes ? sd.progressNotes : "",
        }))
      : (appointment.dayWiseStatus || []).map((s) => ({
          date: s.date ? new Date(s.date) : new Date(),
          status: s.status || "pending",
          progressNotes: s.progressNotes || "",
        }));

    // Ensure appointmentId is an ObjectId for matching
    let apptId;
    try {
      apptId = mongoose.Types.ObjectId(appointment.appointmentId.toString());
    } catch (e) {
      apptId = appointment.appointmentId;
    }

    // Persist only the modified appointment subfields to avoid validation errors
    try {
      // find the index of the appointment in the trainer document to avoid type-matching issues
      const aptIndex = trainerData.appointments.findIndex((a) => a.appointmentId && a.appointmentId.toString && a.appointmentId.toString() === appointmentId.toString());
      if (aptIndex === -1) throw new Error("Appointment index not found for persistence");

      const updateObj = {};
      updateObj[`appointments.${aptIndex}.status`] = appointment.status;
      if (appointment.acceptedAt) updateObj[`appointments.${aptIndex}.acceptedAt`] = appointment.acceptedAt;
      if (appointment.completedAt) updateObj[`appointments.${aptIndex}.completedAt`] = appointment.completedAt;

      // Also update the corresponding trainingPlan.sessionDates in-place (preserve trainingPlan object and _id)
      const planIndex = Array.isArray(trainerData.trainingPlans)
        ? trainerData.trainingPlans.findIndex((p) => p.appointmentId && p.appointmentId.toString && p.appointmentId.toString() === appointment.appointmentId.toString())
        : -1;
      if (planIndex !== -1) {
        const existingSessionDates = trainerData.trainingPlans[planIndex].sessionDates || [];
        const newSessionDates = existingSessionDates.map((sd, i) => {
          if (i === idx) {
            return {
              day: sd && sd.day !== undefined ? sd.day : i + 1,
              date: (sd && sd.date) || (persistedDayWise[i] && persistedDayWise[i].date ? new Date(persistedDayWise[i].date).toISOString().split("T")[0] : (sd && sd.date)),
              time: (sd && sd.time) || appointment.trainingPlan?.sessionTime || appointment.dailyVisitTime || "",
              dateTime: (sd && sd.dateTime) || (persistedDayWise[i] && persistedDayWise[i].date ? new Date(persistedDayWise[i].date).toISOString() : (sd && sd.dateTime)),
              status: persistedDayWise[i] ? persistedDayWise[i].status : (sd && sd.status) || "pending",
              progressNotes: persistedDayWise[i] ? persistedDayWise[i].progressNotes || "" : (sd && sd.progressNotes) || "",
            };
          }
          return {
            day: sd && sd.day !== undefined ? sd.day : i + 1,
            date: sd && sd.date,
            time: sd && sd.time,
            dateTime: sd && sd.dateTime,
            status: (sd && sd.status) || "pending",
            progressNotes: (sd && sd.progressNotes) || "",
          };
        });
        updateObj[`trainingPlans.${planIndex}.sessionDates`] = newSessionDates;
        // if the appointment embeds a trainingPlan, update its sessionDates too
        if (appointment.trainingPlan) {
          updateObj[`appointments.${aptIndex}.trainingPlan.sessionDates`] = newSessionDates;
        }
      } else {
        // No linked trainingPlans entry - update the appointment.sessionDates array in-place
        const newAptSessionDates = persistedDayWise.map((sd, i) => ({
          day: sd && sd.day !== undefined ? sd.day : i + 1,
          date: sd && sd.date ? new Date(sd.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          time: appointment.trainingPlan?.sessionTime || appointment.dailyVisitTime || "",
          dateTime: sd && sd.date ? new Date(sd.date).toISOString() : new Date().toISOString(),
          status: sd && sd.status ? sd.status : "pending",
          progressNotes: sd && sd.progressNotes ? sd.progressNotes : "",
        }));
        updateObj[`appointments.${aptIndex}.sessionDates`] = newAptSessionDates;
      }

      updateObj.updatedAt = new Date();
      await Trainer.updateOne(
        { _id: trainerData._id },
        { $set: updateObj },
        { runValidators: false }
      );

      // After updateOne, ensure the embedded appointment.trainingPlan.sessionDates is in sync with trainingPlans
      try {
        const freshTrainer = await Trainer.findById(trainerData._id);
        if (freshTrainer && planIndex !== -1) {
          const planDates = freshTrainer.trainingPlans && freshTrainer.trainingPlans[planIndex] && freshTrainer.trainingPlans[planIndex].sessionDates;
          if (Array.isArray(planDates)) {
            // find appointment index in freshTrainer
            const aptIdxRefresh = freshTrainer.appointments.findIndex((a) => a.appointmentId && a.appointmentId.toString && a.appointmentId.toString() === appointment.appointmentId.toString());
            if (aptIdxRefresh !== -1) {
              const currentEmbedded = freshTrainer.appointments[aptIdxRefresh].trainingPlan && freshTrainer.appointments[aptIdxRefresh].trainingPlan.sessionDates;
              // Compare stringified; if different, update embedded copy
              const same = JSON.stringify(currentEmbedded || []) === JSON.stringify(planDates || []);
              if (!same) {
                const setObj = {};
                setObj[`appointments.${aptIdxRefresh}.trainingPlan.sessionDates`] = planDates;
                setObj.updatedAt = new Date();
                await Trainer.updateOne({ _id: trainerData._id }, { $set: setObj }, { runValidators: false });
              }
            }
          }
        }
      } catch (syncErr) {
        console.warn("Failed to sync embedded appointment.trainingPlan.sessionDates after updateOne:", syncErr.message);
      }
    } catch (e) {
      console.warn("Failed to persist session update via updateOne:", e.message);
      // as a last resort, attempt to update trainingPlans and embedded trainingPlan.sessionDates then save
      try {
        const planIndexFallback = Array.isArray(trainerData.trainingPlans)
          ? trainerData.trainingPlans.findIndex((p) => p.appointmentId && p.appointmentId.toString && p.appointmentId.toString() === appointment.appointmentId.toString())
          : -1;
        if (planIndexFallback !== -1) {
          trainerData.trainingPlans[planIndexFallback].sessionDates = trainerData.trainingPlans[planIndexFallback].sessionDates.map((sd, i) => ({
            day: sd && sd.day !== undefined ? sd.day : i + 1,
            date: (sd && sd.date) || (persistedDayWise[i] && new Date(persistedDayWise[i].date).toISOString().split("T")[0]),
            time: (sd && sd.time) || appointment.trainingPlan?.sessionTime || appointment.dailyVisitTime || "",
            dateTime: (sd && sd.dateTime) || (persistedDayWise[i] && new Date(persistedDayWise[i].date).toISOString()),
            status: persistedDayWise[i] ? persistedDayWise[i].status : (sd && sd.status) || "pending",
            progressNotes: persistedDayWise[i] ? persistedDayWise[i].progressNotes || "" : (sd && sd.progressNotes) || "",
          }));
          if (appointment.trainingPlan) {
            appointment.trainingPlan.sessionDates = trainerData.trainingPlans[planIndexFallback].sessionDates;
          }
        }
        await trainerData.save();
      } catch (saveErr) {
        console.error("Fallback save also failed:", saveErr.message);
        return res.status(500).json({ message: "Failed to persist session update", error: saveErr.message });
      }
    }

    // Return the fresh appointment from DB to keep list/detail in sync
    try {
      const fresh = await Trainer.findOne({ _id: trainerData._id }, { appointments: { $elemMatch: { appointmentId: apptId } } });
      const freshApt = fresh && fresh.appointments && fresh.appointments[0] ? fresh.appointments[0] : appointment;
      return res.json(normalizeAppointmentOutput(freshApt));
    } catch (e) {
      console.warn("Could not re-fetch appointment after update, returning in-memory version:", e.message);
      return res.json(normalizeAppointmentOutput(appointment));
    }
  } catch (error) {
    console.error("Error updating session status:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      errors: error.errors,
      fullError: JSON.stringify(error, null, 2),
    });
    res.status(500).json({
      message: "Error updating session status",
      error: error.message,
      details: error.errors ? Object.keys(error.errors) : undefined,
    });
  }
});

// Extend an existing appointment by adding more sessions
router.post("/:appointmentId/extend", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.params;
    const { additionalDays, timeOfDay } = req.body;

    const extraDaysNum = Number(additionalDays);
    if (!Number.isInteger(extraDaysNum) || extraDaysNum <= 0) {
      return res.status(400).json({ message: "additionalDays must be a positive integer" });
    }

    const trainerData = await Trainer.findOne({ userId });
    if (!trainerData) return res.status(404).json({ message: "Trainer not found" });

    const appointment = trainerData.appointments.find((apt) => apt.appointmentId.toString() === appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Find the associated service to preserve original schedule characteristics
    const service = trainerData.services.find((svc) => appointment.serviceId && svc._id.toString() === appointment.serviceId.toString());

    // Determine the start date for extension (day after the last scheduled session or today if none)
    let baseStart = appointment.sessionDates && appointment.sessionDates.length > 0
      ? new Date(appointment.sessionDates[appointment.sessionDates.length - 1])
      : new Date(appointment.startDate || Date.now());
    baseStart.setDate(baseStart.getDate() + 1);

    // Generate new sessions using same tier/frequency rules; keep or override timeOfDay
    const newSessions = generateSessions({
      tier: appointment.tier || service?.tier,
      startDate: baseStart,
      timeOfDay: timeOfDay || appointment.timeOfDay,
      customDuration: extraDaysNum,
      frequency: service?.frequency,
      daysPerWeek: service?.daysPerWeek,
    });

    // Append to appointment
    appointment.sessionDates = [...(appointment.sessionDates || []), ...newSessions];
    const newStatuses = newSessions.map((d) => ({ date: d, status: "pending" }));
    appointment.dayWiseStatus = [...(appointment.dayWiseStatus || []), ...newStatuses];

    // If appointment was completed previously, move it back to in_progress due to new sessions
    const allCompleted = appointment.dayWiseStatus.length > 0 && appointment.dayWiseStatus.every((s) => s.status === "completed");
    const anyCompleted = appointment.dayWiseStatus.some((s) => s.status === "completed");
    if (allCompleted) appointment.status = "completed";
    else if (anyCompleted) appointment.status = "in_progress";
    else appointment.status = "pending";

    // Ensure appointmentTime points to the next upcoming session if past
    if (appointment.sessionDates && appointment.sessionDates.length > 0) {
      const now = new Date();
      const upcoming = appointment.sessionDates.find((d) => new Date(d) >= now);
      appointment.appointmentTime = upcoming || appointment.sessionDates[appointment.sessionDates.length - 1];
    }

    // Persist only the updated appointment subfields to avoid validation issues
    try {
      const aptIndex = trainerData.appointments.findIndex((a) => a.appointmentId && a.appointmentId.toString && a.appointmentId.toString() === appointmentId.toString());
      if (aptIndex === -1) throw new Error("Appointment index not found for persistence");
      const updateObj = {};
      updateObj[`appointments.${aptIndex}.sessionDates`] = appointment.sessionDates;
      updateObj[`appointments.${aptIndex}.dayWiseStatus`] = appointment.dayWiseStatus;
      updateObj[`appointments.${aptIndex}.status`] = appointment.status;
      updateObj[`appointments.${aptIndex}.appointmentTime`] = appointment.appointmentTime;

      // Also append to existing trainingPlan.sessionDates if a plan exists for this appointment
      const planIndex = Array.isArray(trainerData.trainingPlans)
        ? trainerData.trainingPlans.findIndex((p) => p.appointmentId && p.appointmentId.toString && p.appointmentId.toString() === appointment.appointmentId.toString())
        : -1;
      if (planIndex !== -1) {
        const existing = trainerData.trainingPlans[planIndex].sessionDates || [];
        const convertedNew = newSessions.map((d, i) => ({
          day: existing.length + i + 1,
          date: new Date(d).toISOString().split("T")[0],
          time: timeOfDay || appointment.timeOfDay || appointment.dailyVisitTime || appointment.trainingPlan?.sessionTime || "",
          dateTime: new Date(d).toISOString(),
          status: "pending",
          progressNotes: "",
        }));
        updateObj[`trainingPlans.${planIndex}.sessionDates`] = [...existing, ...convertedNew];
        if (appointment.trainingPlan) {
          updateObj[`appointments.${aptIndex}.trainingPlan.sessionDates`] = [...(appointment.trainingPlan.sessionDates || []), ...convertedNew];
        }
      }

      updateObj.updatedAt = new Date();
      await Trainer.updateOne(
        { _id: trainerData._id },
        { $set: updateObj },
        { runValidators: false }
      );
    } catch (e) {
      console.warn("Failed to persist appointment extension via updateOne, falling back to save:", e.message);
      await trainerData.save();
    }

    try {
      const fresh = await Trainer.findOne({ _id: trainerData._id }, { appointments: { $elemMatch: { appointmentId: appointment.appointmentId } } });
      const freshApt = fresh && fresh.appointments && fresh.appointments[0] ? fresh.appointments[0] : appointment;
      return res.json(normalizeAppointmentOutput(freshApt));
    } catch (e) {
      return res.json(normalizeAppointmentOutput(appointment));
    }
  } catch (error) {
    console.error("Error extending appointment:", error);
    res.status(500).json({ message: "Error extending appointment", error: error.message });
  }
});

// Complete appointment with follow-up info
router.patch("/:appointmentId/complete", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.params;
    const { followUpRequired, followUpDate, notes } = req.body;

    const trainerData = await Trainer.findOne({ userId });
    if (!trainerData) return res.status(404).json({ message: "Trainer not found" });

    const appointment = trainerData.appointments.find((apt) => apt.appointmentId.toString() === appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (followUpRequired !== undefined) {
      appointment.followUpRequired = !!followUpRequired;
    }
    if (followUpDate) {
      const d = new Date(followUpDate);
      if (!isNaN(d.getTime())) appointment.followUpDate = d;
    }
    if (notes !== undefined) {
      appointment.notes = notes;
    }
    appointment.status = "completed";
    appointment.completedAt = new Date();

    // Persist only the changed appointment fields to avoid validation issues
    try {
      const aptIndex = trainerData.appointments.findIndex((a) => a.appointmentId && a.appointmentId.toString && a.appointmentId.toString() === appointmentId.toString());
      if (aptIndex === -1) throw new Error("Appointment index not found for persistence");
      const updateObj = {};
      updateObj[`appointments.${aptIndex}.status`] = appointment.status;
      updateObj[`appointments.${aptIndex}.completedAt`] = appointment.completedAt;
      if (appointment.followUpRequired !== undefined) updateObj[`appointments.${aptIndex}.followUpRequired`] = appointment.followUpRequired;
      if (appointment.followUpDate) updateObj[`appointments.${aptIndex}.followUpDate`] = appointment.followUpDate;
      if (appointment.notes !== undefined) updateObj[`appointments.${aptIndex}.notes`] = appointment.notes;

      updateObj.updatedAt = new Date();
      await Trainer.updateOne(
        { _id: trainerData._id },
        { $set: updateObj },
        { runValidators: false }
      );
    } catch (e) {
      console.warn("Failed to persist appointment completion via updateOne, falling back to save:", e.message);
      await trainerData.save();
    }

    try {
      const fresh = await Trainer.findOne({ _id: trainerData._id }, { appointments: { $elemMatch: { appointmentId: appointment.appointmentId } } });
      const freshApt = fresh && fresh.appointments && fresh.appointments[0] ? fresh.appointments[0] : appointment;
      return res.json(normalizeAppointmentOutput(freshApt));
    } catch (e) {
      return res.json(normalizeAppointmentOutput(appointment));
    }
  } catch (error) {
    console.error("Error completing trainer appointment:", error);
    res.status(500).json({ message: "Error completing appointment", error: error.message });
  }
});

export default router;
