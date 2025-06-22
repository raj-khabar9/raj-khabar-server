import express from "express";
import {
  register,
  login,
  logout,
  updatePassword,
  getCurrentUser,
  updateProfile,
  getAllUsers,
  manageUser
} from "../controllers/auth.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import multer from "multer";
import { body, validationResult } from "express-validator";
const upload = multer();

const authRouter = express.Router();

authRouter.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("firstName").isString().trim().escape(),
    body("lastName").isString().trim().escape()
  ],
  register
);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/updatepassword", authMiddleware, updatePassword);
authRouter.get("/me", authMiddleware, getCurrentUser);
authRouter.put(
  "/update-profile",
  authMiddleware,
  upload.single("file"),
  updateProfile
);
authRouter.get("/all-users", authMiddleware, getAllUsers);
authRouter.put(
  "/manage-user/:id",
  authMiddleware,
  [
    body("role").optional().isIn(["superadmin"]),
    body("isActive").optional().isBoolean()
  ],
  manageUser
);
export { authRouter };
