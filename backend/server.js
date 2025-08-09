import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import formRoutes from "./routes/forms.js";
import responseRoutes from "./routes/responses.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://interactive-form-builder.onrender.com"]
        : ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);

if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../frontend/dist");
  console.log("Serving static files from:", staticPath);

  // Check if dist directory exists
  if (!fs.existsSync(staticPath)) {
    console.error("Static files directory not found:", staticPath);
  }

  app.use(
    express.static(staticPath, {
      maxAge: "1d",
      etag: false,
    })
  );

  app.get("*", (_req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: "Frontend build not found" });
    }
  });
} else {
  app.get("*", (_req, res) => {
    res.json({ message: "API is running in development mode" });
  });
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
