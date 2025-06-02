import express from "express";
import cors from "cors";
import axios from "axios";
import { connectDB } from "./config/db.js";
import forumRoute from "./routes/forumRoute.js";
import authRoute from "./routes/authRoute.js";
import imageRoute from "./routes/imageRoute.js";

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//db connection
connectDB();

app.use("/api/forum", forumRoute);

app.use("/api/user", authRoute);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/upload", imageRoute);

app.get("/", (req, res) => {
  res.send("API Working");
});







import express from "express";
import cors from "cors";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// MongoDB config and custom routes
import { connectDB } from "./config/db.js";
import forumRoute from "./routes/forumRoute.js";
import authRoute from "./routes/authRoute.js";
import voiceRoute from "./routes/voiceRoute.js"; // ✅ Import voice route
import imageRoute from "./routes/imageRoute.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: "uploads/" });
const FASTAPI_BASE_URL = "https://gradientgang-279556857326.asia-south1.run.app";

// Middleware
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB
connectDB();

// ✅ API routes
app.use("/api/forum", forumRoute);
app.use("/api/user", authRoute);
app.use("/api/voice", voiceRoute); // ✅ Mount voice route
app.use("/api/image", imageRoute);

// ✅ FastAPI Proxy Routes
app.post("/convert", async (req, res) => {
  try {
    const response = await axios.post(`${FASTAPI_BASE_URL}/convert/`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error in /convert:", error.message, error.response?.data);
    res.status(500).json({ error: "Failed to convert recipe ingredient." });
  }
});

app.post("/refresh-data", async (req, res) => {
  try {
    const response = await axios.post(`${FASTAPI_BASE_URL}/refresh-data/`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error in /refresh-data:", error.message, error.response?.data);
    res.status(500).json({ error: "Failed to refresh ingredient data." });
  }
});

app.get("/ingredients", async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_BASE_URL}/ingredients/`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error in /ingredients:", error.message, error.response?.data);
    res.status(500).json({ error: "Failed to get ingredients." });
  }
});

app.get("/ingredients/:ingredientName", async (req, res) => {
  const name = req.params.ingredientName;
  try {
    const response = await axios.get(`${FASTAPI_BASE_URL}/ingredients/${name}`);
    res.json(response.data);
  } catch (error) {
    console.error(`❌ Error fetching ingredient '${name}':`, error.message, error.response?.data);
    res.status(500).json({ error: `Failed to get ingredient: ${name}` });
  }
});

app.post("/ingredients", async (req, res) => {
  try {
    const response = await axios.post(`${FASTAPI_BASE_URL}/ingredients/`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error in /ingredients:", error.message, error.response?.data);
    res.status(500).json({ error: "Failed to add new ingredient." });
  }
});

// app.post("/extract-ingredients", upload.single("file"), async (req, res) => {
//   const filePath = req.file.path;
//   const formData = new FormData();
//   formData.append("file", fs.createReadStream(filePath));

//   try {
//     const response = await axios.post(`${FASTAPI_BASE_URL}/extract-ingredients/`, formData, {
//       headers: formData.getHeaders(),
//     });
//     res.json(response.data);
//   } catch (error) {
//     console.error("❌ Error in /extract-ingredients:", error.message, error.response?.data);
//     res.status(500).json({ error: "Failed to extract and convert from image." });
//   } finally {
//     try {
//       fs.unlinkSync(filePath);
//     } catch (err) {
//       console.warn("⚠️ Could not delete temp file:", err.message);
//     }
//   }
// });

// ✅ Serve static frontend (for Docker/Production)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Support frontend routing in SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



























// FastAPI endpoint
const FASTAPI_URL = "https://gradientgang-ml.onrender.com/convert";

app.post("/convert", async (req, res) => {
  const { recipe_text } = req.body;

  try {
    // Send POST request to FastAPI server
    const response = await axios.post(FASTAPI_URL, { recipe_text });

    // Send the FastAPI response back to client
    res.json({ result: response.data.message });
  } catch (error) {
    console.error("Error calling FastAPI:", error.message);
    res.status(500).json({ error: "Failed to get response from FastAPI." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
