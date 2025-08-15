import mongoose from "mongoose";

// Schema for a single service offered by the vet
const serviceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String }, // e.g., "30 minutes"
  description: { type: String },
  appointmentRequired: { type: Boolean, default: true },
  isEmergency: { type: Boolean, default: false },
});

// Schema for a single appointment
const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  patientName: { type: String, required: true },
  petParent: { type: String, required: true },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  serviceName: { type: String, required: true },
  appointmentTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["scheduled", "confirmed", "in_progress", "completed", "cancelled"],
    default: "scheduled",
  },
  notes: { type: String },
  symptoms: { type: String },
  isEmergency: { type: Boolean, default: false },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Additional fields for completion
  completedAt: { type: Date },
  diagnosis: { type: String },
  treatment: { type: String },
  prescription: {
    medications: [
      {
        name: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        duration: { type: String },
      },
    ],
    instructions: { type: String },
  },
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  documents: [
    {
      type: { type: String },
      url: { type: String },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
}, {
  timestamps: true
});

// The main schema for a single Vet document
const vetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BUser",
      required: true,
      unique: true,
    },
    services: {
      type: [serviceSchema],
      default: [],
    },
    appointments: {
      type: [appointmentSchema],
      default: [],
    },
    patientIds: [
      {
        // An array of IDs for all patients (pet owners) they have served
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    emergency24Hrs: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Vet = mongoose.model("Vet", vetSchema);
export default Vet;
