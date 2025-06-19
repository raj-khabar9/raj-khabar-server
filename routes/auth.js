import express from "express";
import {
  register,
  login,
  logout,
  updatePassword,
  getCurrentUser
} from "../controllers/auth.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import multer from "multer";
const upload = multer();

const authRouter = express.Router();

authRouter.post("/register", upload.single("file"), register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/updatepassword", authMiddleware, updatePassword);
authRouter.get("/me", authMiddleware, getCurrentUser);
export { authRouter };
