import path from "path";

export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ message: "Image uploaded", filePath });
};
