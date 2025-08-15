import mongoose from "mongoose";

// Schema for a single adoptable pet's profile
const petProfileSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  species: { type: String, required: true },
  breed: { type: String },
  age: { type: String },
  description: { type: String },
  photos: [{ type: String }], // Array of image URLs
  status: {
    type: String,
    enum: ["available", "pending", "adopted"],
    default: "available",
  },
  medicalHistory: { type: String }, // A summary of medical notes
});

// Schema for a single donation
const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  amount: { type: Number, required: true },
  purpose: { type: String },
  date: { type: Date, default: Date.now },
});

// Schema for a single event
const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  price: { type: Number, default: 0 },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  time: { type: String },
  description: { type: String },
});

// The main schema for a single NGO document
const ngoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BUser",
      required: true,
      unique: true,
    },
    petProfiles: {
      type: [petProfileSchema],
      default: [],
    },
    donations: {
      type: [donationSchema],
      default: [],
    },
    events: {
      type: [eventSchema],
      default: [],
    },
    photos: [{ type: String }], // General gallery photos for the NGO
  },
  { timestamps: true }
);

const NGO = mongoose.model("NGO", ngoSchema);
export default NGO;
