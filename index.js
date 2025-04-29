import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./database/db.js";
import { authRouter } from "./routes/auth.js";
import { categoryRouter } from "./routes/categoryRoutes.js";
import { postRouter } from "./routes/postRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

//Get Method
app.get("/", (req, res) => {
  res.send("Hello World! from the backend lets create a new project");
});

connectDB();
app.use(cookieParser()); // Middleware to parse cookies
app.use(express.json()); // Middleware to parse JSON request body

//Mounting the authRouter on the app
app.use("/api/auth", authRouter);
app.use("/api/category", categoryRouter);
app.use("/api/post", postRouter);

app.listen(PORT, () => {
  console.log("APP is running on port " + PORT);
});
