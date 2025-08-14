import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./database/db.js";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { categoryRouter } from "./routes/categoryRoutes.js";
import { postRouter } from "./routes/postRoutes.js";
import { structureRouter } from "./routes/structureRoutes.js";
import { tablePostRouter } from "./routes/tablePostRoutes.js";
import { cardRouter } from "./routes/cardRoutes.js";
import { headerComponentRouter } from "./routes/headerComponentRoutes.js";
import { socialRoute } from "./routes/socialRoutes.js";
import { s3Router } from "./routes/s3Routes.js";
import { centralizedRouter } from "./routes/centralizedRoutes.js";
import { deviceRouter } from "./routes/deviceRoutes.js";
import { notificationRouter } from "./routes/notificationRoutes.js";
import { bulkDeleteRouter } from "./routes/bulkDeleteRoutes.js";

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
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://rajkhabarfrontend-production.up.railway.app",
      ];
      // allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

//Mounting the authRouter on the app
app.use("/api/auth", authRouter);
app.use("/api/category", categoryRouter);
app.use("/api/post", postRouter);
app.use("/api/structure", structureRouter);
app.use("/api/table", tablePostRouter);
app.use("/api/card", cardRouter);
app.use("/api/component", headerComponentRouter);
app.use("/api/social", socialRoute);
app.use("/api/s3", s3Router);
app.use("/api/centralized", centralizedRouter);
app.use("/api/device", deviceRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/bulk-delete", bulkDeleteRouter);

app.listen(PORT, () => {
  console.log("APP is running on port " + PORT);
});
