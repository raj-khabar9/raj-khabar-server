import { uploadImage } from "../controllers/s3ImagesController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import express from "express";
import multer from "multer";
const upload = multer();

const s3Router = express.Router();
// S3 image upload route
s3Router.post("/upload", authMiddleware, upload.single("file"), uploadImage);

export { s3Router };
