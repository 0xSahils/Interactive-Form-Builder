import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import formRoutes from "./routes/forms.js";
import responseRoutes from "./routes/responses.js";
import path from "path";
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
  const staticPath = path.join(__dirname, "../frontend/dist");

  app.use(express.static(staticPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
} else {
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
