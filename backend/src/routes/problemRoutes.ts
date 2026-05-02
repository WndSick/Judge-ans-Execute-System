import express from "express";
import * as problemController from "../controllers/problemController.js";
import optionalAuthMiddleware from "../middlewares/optionalAuthMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();
console.log('ProblemRouter [V2-FIXED] initialized');

// Public routes
router.get("/", problemController.getProblems);

// Specific routes before generic ones
router.post("/:id/run", authMiddleware, problemController.runProblem);
router.get("/:id", optionalAuthMiddleware, problemController.getProblemById);

export default router;
