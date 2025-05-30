import express from "express";
import cors from "cors";
import axios from "axios";
import { connectDB } from "./config/db.js";
import forumRoute from "./routes/forumRoute.js";
import authRoute from "./routes/authRoute.js";
import dotenv from "dotenv";


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

//db connection
connectDB();

app.use("/api/forum", forumRoute);

app.use("/api/user", authRoute);

app.get("/", (req, res) => {
  res.send("API Working");
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
