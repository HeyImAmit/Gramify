import express from "express";
import cors from "cors";
import axios from "axios";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import forumRoute from "./routes/forumRoute.js";
import authRoute from "./routes/authRoute.js";
import voiceRoute from "./routes/voiceRoute.js";
import imageRoute from "./routes/imageRoute.js";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FASTAPI_BASE_URL = process.env.FASTAPI_URL || "http://34.42.75.172:8000";

app.use(express.json());
app.use(cors());

connectDB();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/forum", forumRoute);
app.use("/api/user", authRoute);
app.use("/api/voice", voiceRoute);
app.use("/api/image", imageRoute);

// Proxy FastAPI calls
app.post("/convert", async (req, res) => {
  try {
    const response = await axios.post(`${FASTAPI_BASE_URL}/convert/`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Error in /convert:", error.message);
    res.status(500).json({ error: "Failed to convert." });
  }
});

app.post("/refresh-data", async (req, res) => {
  try {
    const response = await axios.post(`${FASTAPI_BASE_URL}/refresh-data/`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to refresh data." });
  }
});

app.get("/ingredients", async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_BASE_URL}/ingredients/`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to get ingredients." });
  }
});

app.get("/ingredients/:ingredientName", async (req, res) => {
  try {
    const response = await axios.get(
      `${FASTAPI_BASE_URL}/ingredients/${req.params.ingredientName}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to get ingredient." });
  }
});

app.post("/ingredients", async (req, res) => {
  try {
    const response = await axios.post(
      `${FASTAPI_BASE_URL}/ingredients/`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to add ingredient." });
  }
});

// No frontend serving — handled by Vercel
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
