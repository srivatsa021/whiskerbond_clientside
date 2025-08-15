import mongoose from "mongoose";

const vetServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    duration: { type: String },
    category: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    businessType: {
      type: String,
      required: true,
      enum: ["vet"],
      default: "vet",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BUser",
      required: true,
    },
    isEmergency: { type: Boolean, default: false },
    requiresAppointment: { type: Boolean, default: true },
    equipmentNeeded: [String],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
vetServiceSchema.index({ userId: 1 });
vetServiceSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model("VetService", vetServiceSchema);
