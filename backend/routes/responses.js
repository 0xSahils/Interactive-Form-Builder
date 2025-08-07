import express from "express";
import {
  submitResponse,
  getFormResponses,
  getFormAnalytics,
  getResponseById,
  deleteResponse,
} from "../controllers/responseController.js";

const router = express.Router();

router.post("/", submitResponse);
router.get("/form/:formId", getFormResponses);
router.get("/analytics/:formId", getFormAnalytics);
router.get("/:id", getResponseById);
router.delete("/:id", deleteResponse);

export default router;
