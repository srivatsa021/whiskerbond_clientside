import express from "express";
import NGO from "../models/NGO.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get all pet profiles for the authenticated NGO
router.get("/", authenticateToken, async (req, res) => {
  try {
    const ngo = await NGO.findOne({ userId: req.userId });
    if (!ngo) {
      return res.status(404).json({ message: "NGO profile not found" });
    }
    res.json(ngo.petProfiles);
  } catch (error) {
    console.error("Get pet profiles error:", error);
    res.status(500).json({ message: "Server error fetching pet profiles" });
  }
});

// Add a new pet profile
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { petName, species, breed, age, description } = req.body;

    const ngo = await NGO.findOne({ userId: req.userId });
    if (!ngo) {
      return res.status(404).json({ message: "NGO profile not found" });
    }

    const newPet = {
      petName,
      species,
      breed,
      age,
      description,
    };

    ngo.petProfiles.push(newPet);
    await ngo.save();

    res.status(201).json(ngo.petProfiles[ngo.petProfiles.length - 1]);
  } catch (error) {
    console.error("Create pet profile error:", error);
    res.status(500).json({ message: "Server error creating pet profile" });
  }
});

// Update a pet profile
router.put("/:petId", authenticateToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const { petName, species, breed, age, description } = req.body;

    const ngo = await NGO.findOne({ userId: req.userId });
    if (!ngo) {
      return res.status(404).json({ message: "NGO profile not found" });
    }

    const pet = ngo.petProfiles.id(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet profile not found" });
    }

    pet.petName = petName;
    pet.species = species;
    pet.breed = breed;
    pet.age = age;
    pet.description = description;

    await ngo.save();
    res.json(pet);
  } catch (error) {
    console.error("Update pet profile error:", error);
    res.status(500).json({ message: "Server error updating pet profile" });
  }
});

// Delete a pet profile
router.delete("/:petId", authenticateToken, async (req, res) => {
  try {
    const { petId } = req.params;

    const ngo = await NGO.findOne({ userId: req.userId });
    if (!ngo) {
      return res.status(404).json({ message: "NGO profile not found" });
    }

    const pet = ngo.petProfiles.id(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet profile not found" });
    }

    ngo.petProfiles.pull(petId);
    await ngo.save();

    res.json({ message: "Pet profile deleted successfully" });
  } catch (error) {
    console.error("Delete pet profile error:", error);
    res.status(500).json({ message: "Server error deleting pet profile" });
  }
});

export default router;
