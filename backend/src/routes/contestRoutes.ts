import express from "express";
import * as contestController from "../controllers/contestController.js";

const router = express.Router();

router.get("/", contestController.getContests);
router.get("/:id", contestController.getContestById);

export default router;
