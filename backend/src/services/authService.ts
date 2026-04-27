import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User.js";

interface CustomError extends Error {
  statusCode?: number;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const signToken = (user: IUser) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    const error: CustomError = new Error("JWT_SECRET is not configured");
    error.statusCode = 500;
    throw error;
  }

  return jwt.sign({ userId: user._id.toString(), role: user.role }, jwtSecret, {
    expiresIn: "7d"
  });
};

export const registerUser = async (email: string, password: string) => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error: CustomError = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ email: normalizedEmail, password });
  const token = signToken(user);

  return {
    user: { id: user._id, email: user.email, role: user.role },
    token
  };
};

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !(await user.comparePassword(password))) {
    const error: CustomError = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = signToken(user);
  return {
    user: { id: user._id, email: user.email, role: user.role },
    token
  };
};
