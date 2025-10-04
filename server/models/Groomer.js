import mongoose from "mongoose";

// Schema for a single service offered by the groomer
const serviceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String }, // e.g., "30 minutes"
  description: { type: String },
  appointmentRequired: { type: Boolean, default: true },
});

// Appointment schema for groomers
const appointmentSchema = new mongoose.Schema(
  {
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
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completedAt: { type: Date },
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

// Groomer profile schema
const groomerSchema = new mongoose.Schema(
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
    // Groomer-specific settings
    establishmentRegistrationNumber: { type: String },
    establishmentRegistrationAuthority: { type: String },
    establishmentRegistrationDocumentUrl: { type: String },
    identityProofType: { type: String }, // e.g., Aadhaar, Driver License, Passport
    identityProofUrl: { type: String }, // URL/Base64 for uploaded identity proof
  },
  { timestamps: true }
);

const Groomer = mongoose.model("Groomer", groomerSchema);
export default Groomer;
