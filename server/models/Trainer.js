import mongoose from "mongoose";

// Schema for a single service offered by the trainer (tiered or custom)
const serviceSchema = new mongoose.Schema(
  {
    serviceName: { type: String, required: true },
    description: { type: String },
    tier: { type: String, enum: ["tier1", "tier2", "tier3", "custom"], required: true },
    basePrice: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    duration: { type: String }, // e.g., "1 week", "3 weeks"
    frequency: { type: String, enum: ["daily", "alternate", "days_per_week"], default: undefined },
    daysPerWeek: { type: Number }, // used when frequency === 'days_per_week'
    serviceTypes: {
      type: [String],
      enum: ["shop", "house"],
      default: [],
    },
  },
  { _id: true, timestamps: true }
);

// Schema for a single appointment/booking (supports multi-day sessions)
// Embedded training plan schema to support per-session progress tracking
const trainingPlanSessionSchema = new mongoose.Schema(
  {
    day: { type: Number },
    date: { type: String }, // e.g., "2025-10-25"
    time: { type: String }, // e.g., "10:30 AM"
    dateTime: { type: String }, // ISO string for exact scheduling
    status: { type: String, enum: ["pending", "completed", "missed"], default: "pending" },
    progressNotes: { type: String, default: "" },
  },
  { _id: false }
);

const trainingPlanSchema = new mongoose.Schema(
  {
    trainingPlanId: { type: mongoose.Schema.Types.ObjectId },
    duration: { type: String }, // e.g., "1 week"
    frequency: { type: String }, // e.g., "daily", "alternate", "days_per_week"
    sessionTime: { type: String }, // e.g., "10:30 AM"
    sessionDates: { type: [trainingPlanSessionSchema], default: [] },
  },
  { _id: false }
);

// Schema for a single appointment/booking (supports multi-day sessions)
const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    // Linkages
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BUser",
    },
    clientName: { type: String },
    petName: { type: String },
    serviceId: { type: mongoose.Schema.Types.ObjectId },
    serviceName: { type: String },
    tier: { type: String, enum: ["tier1", "tier2", "tier3", "custom"] },

    // Scheduling
    startDate: { type: Date },
    sessionDates: { type: [Date], default: [] },
    dayWiseStatus: {
      type: [
        new mongoose.Schema(
          {
            date: { type: Date, required: true },
            status: { type: String, enum: ["pending", "completed", "missed"], default: "pending" },
            progressNotes: { type: String, default: "" },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    timeOfDay: { type: String },
    // For backward-compatibility; typically equals first session
    appointmentTime: { type: Date },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },

    // Lifecycle timestamps
    acceptedAt: { type: Date },
    completedAt: { type: Date },

    // Follow-up details
    followUpRequired: { type: Boolean },
    followUpDate: { type: Date },

    notes: { type: String },
    price: { type: Number },
    duration: { type: String },
    trainingPlan: trainingPlanSchema,
    documents: [
      {
        type: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// The main schema for a single Trainer document
const trainerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BUser",
      required: true,
      unique: true,
    },

    // New tiered services for trainers
    services: {
      type: [serviceSchema],
      default: [],
    },

    // Appointments/bookings for trainer services
    appointments: {
      type: [appointmentSchema],
      default: [],
    },

    // Keep existing fields for backward compatibility
    trainingPlans: {
      type: [serviceSchema],
      default: [],
    },
    sessions: {
      type: [appointmentSchema],
      default: [],
    },

    // Basic finance snapshot (can be expanded later)
    finances: {
      totalRevenue: { type: Number, default: 0 },
      outstandingPayments: { type: Number, default: 0 },
      lastPayoutAt: { type: Date },
    },

    // Trainer-specific verification/settings
    registrationNumber: { type: String },
    registrationAuthority: { type: String },
    registrationDocumentUrl: { type: String },
    identityProofType: { type: String },
    identityProofUrl: { type: String },
  },
  { timestamps: true }
);

const Trainer = mongoose.model("Trainer", trainerSchema);
export default Trainer;
