import { Request, Response, NextFunction } from "express";

const errorMiddleware = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  const response: { message: string; error?: string } = { message };
  if (process.env.NODE_ENV !== "production" && err?.stack) {
    response.error = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorMiddleware;
