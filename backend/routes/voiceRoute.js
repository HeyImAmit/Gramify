// routes/voiceRoute.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { handleVoiceInput } from "../controllers/voiceController.js";

const router = express.Router();

// Configure multer storage with filename to avoid collisions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    // Ensure uploads folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use a timestamp + originalname for uniqueness
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `voice-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // limit to 10MB files
  },
  fileFilter: (req, file, cb) => {
    // Accept only audio mimetypes
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

router.post("/voice-input", upload.single("file"), handleVoiceInput);

// Error handler middleware for multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

export default router;
