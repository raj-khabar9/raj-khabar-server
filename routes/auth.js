import express from "express";
import {
  register,
  login,
  logout,
  updatePassword
} from "../controllers/auth.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/updatepassword", authMiddleware, updatePassword);
export { authRouter };
