import {
  uploadImage,
  listAllFiles,
  deleteFile,
  bulkDeleteFiles
} from "../controllers/s3ImagesController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import express from "express";
import multer from "multer";
const upload = multer();

const s3Router = express.Router();
// S3 image upload route
s3Router.post("/upload", authMiddleware, upload.single("file"), uploadImage);
s3Router.get("/list", authMiddleware, listAllFiles);
s3Router.delete("/delete/:key", authMiddleware, deleteFile);
s3Router.post("/bulk-delete", authMiddleware, bulkDeleteFiles);

export { s3Router };
