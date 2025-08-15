import mongoose from "mongoose";

const boardingAppointmentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // or the client schema you're using
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // duration in hours or minutes
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "in progress", "finished"],
    default: "scheduled",
  },
});

const boardingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BUser",
    required: true,
    unique: true,
  },
  appointments: [boardingAppointmentSchema],
});

const Boarding = mongoose.model("Boarding", boardingSchema);
export default Boarding;
