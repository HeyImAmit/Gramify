import express from "express";
const imageRouter = express.Router();
import multer from "multer";
import { uploadImage } from "../controllers/imageController.js"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

imageRouter.post("/upload-image", upload.single("image"), uploadImage);

export default imageRouter;
