const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadFile = require("../service/storage.service");
const songModel = require("../model/song.model");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");
const PYTHON_DETECTOR = path.join(__dirname, "../service/musicnn_predict.py");

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

    // 3. Detect mood automatically using Python/musicnn (fallback to simple heuristic)
    let detectedMood = null;
    const tmpFileName = uuidv4() + path.extname(req.file.originalname || ".mp3");
    const tmpFilePath = path.join(os.tmpdir(), tmpFileName);

    try {
      // write the uploaded buffer to a temp file
      fs.writeFileSync(tmpFilePath, req.file.buffer);

      // call python script using spawnSync to capture stdout/stderr without throwing
      let detectorOutput = null;
      let detectorError = null;
      const pythonCmds = ["python", "python3"];

      for (const cmd of pythonCmds) {
        try {
          const result = spawnSync(cmd, [PYTHON_DETECTOR, tmpFilePath], { encoding: "utf8", timeout: 20000 });
          if (result.error) {
            detectorError = result.error.message;
            continue;
          }

          const outStr = (result.stdout || "").toString().trim();
          const errStr = (result.stderr || "").toString().trim();

          if (outStr) {
            detectorOutput = outStr;
            if (errStr) detectorError = errStr;
            break;
          }

          if (result.status !== 0) {
            detectorError = errStr || `exit code ${result.status}`;
            continue;
          }
        } catch (e) {
          detectorError = e.message;
          continue;
        }
      }

      if (detectorOutput) {
        try {
          const parsed = JSON.parse(detectorOutput);
          if (parsed && parsed.mood) {
            detectedMood = parsed.mood;
          } else if (parsed && parsed.error) {
            console.error("Detector returned error:", parsed.error);
          } else {
            console.error("Detector returned unexpected output:", detectorOutput);
          }
        } catch (e) {
          console.error("Failed to parse detector output:", detectorOutput, e.message);
        }
      } else {
        console.error("Mood detector failed:", detectorError);
      }
    } catch (err) {
      console.error("Mood detection failed, will fallback to provided mood or null:", err.message);
    } finally {
      // cleanup temp file if it exists
      try { if (fs.existsSync(tmpFilePath)) fs.unlinkSync(tmpFilePath); } catch (e) {}
    }

    // prefer detectedMood; if not available, fall back to user-provided mood (optional), otherwise default to 'neutral'
    const finalMood = detectedMood || req.body.mood || "neutral";

    // 4. Save to Database
    const song = await songModel.create({
      id: uuidv4(),
      title: req.body.title,
      artist: req.body.artist,
      mood: finalMood,
      audioUrl: fileData.url, // Ensure your uploadFile returns an object with .url
    });

    res.status(201).json({
      message: "Song created successfully",
      detectedMood,
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
