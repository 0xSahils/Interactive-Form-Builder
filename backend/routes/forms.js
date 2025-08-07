import express from "express";
import {
  getAllForms,
  getFormById,
  createForm,
  updateForm,
  deleteForm,
  togglePublishForm,
  getPublishedForms,
} from "../controllers/formController.js";

const router = express.Router();

router.get("/", getAllForms);
router.get("/published", getPublishedForms);
router.get("/:id", getFormById);
router.post("/", createForm);
router.put("/:id", updateForm);
router.delete("/:id", deleteForm);
router.put("/:id/publish", togglePublishForm);

export default router;
