import express, { Request, Response } from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import adminMiddleware from "./middlewares/adminMiddleware.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/problems", problemRoutes);
app.use("/contests", contestRoutes);
app.use("/", submissionRoutes);
app.use("/admin", authMiddleware, adminMiddleware, adminRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorMiddleware);

export default app;
