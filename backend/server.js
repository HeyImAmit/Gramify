import express from "express";
import cors from "cors";
import axios from "axios";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";
import FormData from "form-data";

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
const FASTAPI_BASE_URL =
  "https://gradientgang-279556857326.asia-south1.run.app";

app.use(express.json());
app.use(cors());

connectDB();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/forum", forumRoute);
app.use("/api/user", authRoute);
app.use("/api/voice", voiceRoute);
app.use("/api/image", imageRoute);

app.post("/convert", async (req, res) => {
  try {
    const response = await axios.post(`${FASTAPI_BASE_URL}/convert/`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Error in /convert:", error.message, error.response?.data);
    res.status(500).json({ error: "Failed to convert recipe ingredient." });
  }
});

app.post("/refresh-data", async (req, res) => {
  try {
    const response = await axios.post(`${FASTAPI_BASE_URL}/refresh-data/`);
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error in /refresh-data:",
      error.message,
      error.response?.data
    );
    res.status(500).json({ error: "Failed to refresh ingredient data." });
  }
});

app.get("/ingredients", async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_BASE_URL}/ingredients/`);
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error in /ingredients:",
      error.message,
      error.response?.data
    );
    res.status(500).json({ error: "Failed to get ingredients." });
  }
});

app.get("/ingredients/:ingredientName", async (req, res) => {
  const name = req.params.ingredientName;
  try {
    const response = await axios.get(`${FASTAPI_BASE_URL}/ingredients/${name}`);
    res.json(response.data);
  } catch (error) {
    console.error(
      `Error fetching ingredient '${name}':`,
      error.message,
      error.response?.data
    );
    res.status(500).json({ error: `Failed to get ingredient: ${name}` });
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
    console.error(
      "Error in /ingredients:",
      error.message,
      error.response?.data
    );
    res.status(500).json({ error: "Failed to add new ingredient." });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
