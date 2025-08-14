import express from "express";
import { createSocialMediaCard, getAllSocialMediaCards, deleteCardById, updateSocialMediaCard } from "../controllers/socialMediaController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const socialRoute = express.Router();

socialRoute.post("/create-social-link", authMiddleware, createSocialMediaCard);
socialRoute.get("/get-social-link", getAllSocialMediaCards);
socialRoute.put("/update-social-link/:id", authMiddleware, updateSocialMediaCard);
socialRoute.delete("/delete/:id", authMiddleware, deleteCardById);

export { socialRoute };