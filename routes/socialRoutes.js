import express from "express";
import { createSocialMediaCard } from "../controllers/socialMediaController.js";
import { getAllSocialMediaCards } from "../controllers/socialMediaController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const socialRoute = express.Router();

socialRoute.post("/create-social-link", authMiddleware, createSocialMediaCard);
socialRoute.get("/get-social-link", getAllSocialMediaCards);

export { socialRoute };
