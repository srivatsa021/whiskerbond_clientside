import mongoose from "mongoose";

const vetBookingSchema = new mongoose.Schema(
  {
    vetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BUser", // Reference to the vet's business user account
      required: true,
    },
    petOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to pet owner's account
      required: true,
    },
    petDetails: {
      name: { type: String, required: true },
      breed: { type: String },
      age: { type: String },
      species: { type: String, required: true }, // dog, cat, etc.
      weight: { type: String },
      medicalHistory: { type: String },
    },
    appointmentDetails: {
      date: { type: Date, required: true },
      time: { type: String, required: true }, // "09:00 AM"
      serviceType: { type: String, required: true }, // "Checkup", "Surgery", etc.
      duration: { type: String, default: "30 minutes" },
      notes: { type: String }, // Special instructions or notes
    },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },
    pricing: {
      servicePrice: { type: Number, required: true },
      additionalCharges: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refunded"],
        default: "pending",
      },
    },
    completion: {
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
          type: { type: String }, // "prescription", "receipt", "report"
          url: { type: String },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
vetBookingSchema.index({ vetId: 1, "appointmentDetails.date": 1 });
vetBookingSchema.index({ petOwnerId: 1 });
vetBookingSchema.index({ status: 1 });

const VetBooking = mongoose.model("VetBooking", vetBookingSchema, "vet_bookings");
export default VetBooking;
