import {
  uploadImage,
  listAllFiles
} from "../controllers/s3ImagesController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import express from "express";
import multer from "multer";
const upload = multer();

const s3Router = express.Router();
// S3 image upload route
s3Router.post("/upload", authMiddleware, upload.single("file"), uploadImage);
s3Router.get("/list", authMiddleware, listAllFiles);

export { s3Router };
