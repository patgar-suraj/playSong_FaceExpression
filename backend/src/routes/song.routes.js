const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadFile = require("../service/storage.service");
const songModel = require("../model/song.model");
const { v4: uuidv4 } = require("uuid");

// setup multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

router.post("/song", upload.single("audio"), async (req, res) => {
  try {
    // 1. Validate Input
    if (!req.file) {
      return res.status(400).json({ message: "No audio file provided" });
    }
    if (!req.body.title || !req.body.artist) {
      return res.status(400).json({ message: "Title and Artist are required" });
    }

    console.log("Uploading file:", req.file.originalname);

    // 2. Upload to storage
    const fileData = await uploadFile(req.file);

    // 3. Save to Database
    const song = await songModel.create({
      id: uuidv4(),
      title: req.body.title,
      artist: req.body.artist,
      mood: req.body.mood,
      audioUrl: fileData.url, // Ensure your uploadFile returns an object with .url
    });

    res.status(201).json({
      message: "Song created successfully",
      song: song,
    });
  } catch (error) {
    console.error("Error creating song:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.get("/song", async (req, res) => {
  try {
    const { mood } = req.query;

    // 1. Build Query Object dynamically
    // If mood exists, filter by it. If not, return all songs.
    const query = {};
    if (mood) {
      query.mood = mood;
    }

    const songs = await songModel.find(query);

    res.status(200).json({
      message: "Songs fetched successfully",
      count: songs.length,
      songs,
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;
