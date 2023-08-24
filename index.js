import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import AuthRoutes from "./Routes/AuthRoutes.js";
import UserRoute from "./Routes/UserRoutes.js";
import PostRoute from "./Routes/PostRoutes.js";
import UploadRoute from "./Routes/UploadRoute.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5700;

// To serve images for public
app.use(express.static("public"));
app.use("/images", express.static("images"));

// Parse JSON bodies
app.use(express.json());
app.use(cors());

// Routes
app.use("/auth", AuthRoutes);
app.use("/user", UserRoute);
app.use("/post", PostRoute);
app.use("/upload", UploadRoute);

try {
  mongoose.connect(process.env.MONGO_URI).then(() =>
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
      console.log(`Connected to the mongoDB.`);
    })
  );
} catch (error) {
  console.error("Error connecting to MongoDB:", error.message);
}
