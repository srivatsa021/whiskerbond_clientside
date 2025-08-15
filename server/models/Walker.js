import mongoose from "mongoose";

// 🧾 One appointment object (inside array)
const appointmentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // or "Client", whatever you call pet owners
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["upcoming", "current", "completed"],
    default: "upcoming",
  },
});

//One Walker document
const walkerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BUser",
    required: true,
    unique: true,
  },
  appointments: {
    type: [appointmentSchema], // ⬅️ array of objects (not another list inside)
    default: [],
  },
});

const Walker = mongoose.model("Walker", walkerSchema);
export default Walker;
