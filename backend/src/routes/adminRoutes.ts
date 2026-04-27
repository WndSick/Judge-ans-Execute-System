import express from "express";
import * as problemController from "../controllers/problemController.js";
import * as contestController from "../controllers/contestController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Middleware to ensure all admin routes are protected
router.use(authMiddleware, adminMiddleware);

// Problem Management
router.get("/problems", problemController.getAllProblems); // New route
router.post("/problems", problemController.createProblem);
router.put("/problems/:id", problemController.updateProblem);
router.delete("/problems/:id", problemController.deleteProblem);

// Contest Management
router.post("/contests", contestController.createContest);
router.put("/contests/:id", contestController.updateContest);
router.delete("/contests/:id", contestController.deleteContest);

export default router;
