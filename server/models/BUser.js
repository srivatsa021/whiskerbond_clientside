import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const bUserSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    name: { type: String, required: true }, // Person’s name (owner/manager)
    email: { type: String, required: true },
    contactNo: { type: String, required: true },
    businessType: {
      type: String,
      required: true,
      enum: ["vet", "trainer", "boarding", "walker", "ngo"], // Add more if needed
    },
    address: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
bUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
bUserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("BUser", bUserSchema);
