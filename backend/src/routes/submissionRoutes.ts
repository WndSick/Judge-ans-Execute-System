import express from "express";
import * as submissionController from "../controllers/submissionController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/submit", authMiddleware, submissionController.createSubmission);
router.get("/submission/:id", authMiddleware, submissionController.getSubmissionById);
router.get("/submissions/me", authMiddleware, submissionController.getMySubmissions);

export default router;
