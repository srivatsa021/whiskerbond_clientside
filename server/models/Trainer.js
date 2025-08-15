import mongoose from "mongoose";

// Schema for a single service offered by the trainer
const serviceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String }, // e.g., "60 minutes", "4 weeks"
  description: { type: String },
});

// Schema for a single appointment
const appointmentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming "User" or "Client" is your pet owner model
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
});

// The main schema for a single Trainer document
const trainerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BUser",
    required: true,
    unique: true,
  },
  trainingPlans: {
    type: [serviceSchema],
    default: [],
  },
  sessions: {
    type: [appointmentSchema],
    default: [],
  },
});

const Trainer = mongoose.model("Trainer", trainerSchema);
export default Trainer;
