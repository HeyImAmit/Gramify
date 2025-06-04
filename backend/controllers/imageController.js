import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const FASTAPI_BASE_URL =
  "http://127.0.0.1:8000";

export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const filePath = req.file.path;

  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  try {
    const response = await axios.post(
      `${FASTAPI_BASE_URL}/extract-ingredients/`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error sending image to FastAPI:", error.message);
    if (error.response) {
      console.error("🧾 Response from FastAPI:", error.response.data);
    }
    res
      .status(500)
      .json({ error: "Failed to extract ingredients from image." });
  } finally {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn("Failed to delete image:", err.message);
    }
  }
};
