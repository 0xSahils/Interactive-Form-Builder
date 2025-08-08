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
  // Debug information
  console.log("🔍 Debug info:");
  console.log(`__dirname: ${__dirname}`);
  console.log(`process.cwd(): ${process.cwd()}`);

  // Check what files exist in the project root and parent
  try {
    const rootContents = fs.readdirSync(process.cwd());
    console.log("📁 Backend directory contents:", rootContents);

    // Check parent directory (should be /opt/render/project/src)
    const parentDir = path.resolve(process.cwd(), "..");
    console.log("📁 Parent directory path:", parentDir);
    const parentContents = fs.readdirSync(parentDir);
    console.log("📁 Parent directory contents:", parentContents);

    if (parentContents.includes("frontend")) {
      const frontendContents = fs.readdirSync(path.join(parentDir, "frontend"));
      console.log("📁 Frontend directory contents:", frontendContents);

      if (frontendContents.includes("dist")) {
        const distContents = fs.readdirSync(
          path.join(parentDir, "frontend", "dist")
        );
        console.log("📁 Frontend/dist contents:", distContents);
      }
    }
  } catch (error) {
    console.log("❌ Error reading directories:", error.message);
  }

  // Try multiple possible paths for the frontend dist directory
  const possiblePaths = [
    // Most likely correct path based on debug info
    path.resolve(process.cwd(), "..", "frontend", "dist"),
    path.join(__dirname, "../frontend/dist"),
    path.join(__dirname, "../../frontend/dist"),
    path.join(__dirname, "../dist"),
    path.join(__dirname, "dist"),
    // Render-specific absolute paths
    "/opt/render/project/src/frontend/dist",
    "/opt/render/project/frontend/dist",
    "/opt/render/project/dist",
    // Current working directory variants
    path.join(process.cwd(), "frontend/dist"),
    path.join(process.cwd(), "../frontend/dist"),
    path.join(process.cwd(), "dist"),
    // Additional fallback paths
    path.resolve(process.cwd(), "frontend", "dist"),
    path.resolve(__dirname, "..", "frontend", "dist"),
    path.resolve(".", "frontend", "dist"),
  ];

  let staticPath = null;
  let indexPath = null;

  for (const possiblePath of possiblePaths) {
    const indexFile = path.join(possiblePath, "index.html");
    console.log(`Checking for frontend files at: ${possiblePath}`);

    if (fs.existsSync(possiblePath)) {
      console.log(`📁 Directory exists: ${possiblePath}`);
      try {
        const dirContents = fs.readdirSync(possiblePath);
        console.log(`Contents: ${dirContents.join(", ")}`);
      } catch (e) {
        console.log(`❌ Could not read directory: ${e.message}`);
      }
    }

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
} else {
  // Development mode - serve a simple message
  app.get("*", (req, res) => {
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
