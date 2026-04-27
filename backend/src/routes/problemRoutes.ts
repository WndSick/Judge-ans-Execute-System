import express from "express";
import * as problemController from "../controllers/problemController.js";
import optionalAuthMiddleware from "../middlewares/optionalAuthMiddleware.js";

const router = express.Router();

router.get("/", problemController.getProblems);
router.get("/:id", optionalAuthMiddleware, problemController.getProblemById);

export default router;
