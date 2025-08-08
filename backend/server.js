import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import formRoutes from "./routes/forms.js";
import responseRoutes from "./routes/responses.js";
import path from "path";

dotenv.config();

const app = express();
const __dirname = path.resolve();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
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
