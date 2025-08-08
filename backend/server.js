import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import formRoutes from "./routes/forms.js";
import responseRoutes from "./routes/responses.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

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
  // Try multiple possible paths for the frontend dist directory
  const possiblePaths = [
    path.join(__dirname, "../frontend/dist"),
    path.join(__dirname, "../../frontend/dist"),
    path.join(__dirname, "../dist"),
    path.join(__dirname, "dist"),
  ];

  let staticPath = null;
  let indexPath = null;

  for (const possiblePath of possiblePaths) {
    const indexFile = path.join(possiblePath, "index.html");
    console.log(`Checking for frontend files at: ${possiblePath}`);
    console.log(`Looking for index.html at: ${indexFile}`);

    if (fs.existsSync(indexFile)) {
      staticPath = possiblePath;
      indexPath = indexFile;
      console.log(`✅ Found frontend files at: ${staticPath}`);
      break;
    }
  }

  if (staticPath && indexPath) {
    app.use(express.static(staticPath));

    app.get("*", (req, res) => {
      res.sendFile(indexPath);
    });
  } else {
    console.error("❌ Frontend dist files not found! Checked paths:");
    possiblePaths.forEach((p) => console.error(`  - ${p}`));

    app.get("*", (req, res) => {
      res.status(500).json({
        error: "Frontend files not found",
        checkedPaths: possiblePaths,
      });
    });
  }
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
