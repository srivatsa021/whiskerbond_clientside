import jwt from "jsonwebtoken";
import BUser from "../models/BUser.js"; // ✅ Use the new model

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from BUsers collection
    const user = await BUser.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach user info to request
    req.userId = decoded.userId;
    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
