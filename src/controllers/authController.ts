// src/controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

// Register function
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate role
    const validRoles = ['ADMIN', 'TECHNICIAN', 'VIEWER']; // Match Prisma schema
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    return res.status(201).json({
      message: "User registered successfully!",
      user: { email: newUser.email, role: newUser.role },
    });
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 'P2002' && error.meta?.target.includes('email')) {
      return res.status(400).json({ message: "Email already exists." });
    }
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login function
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Me function
export const me = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(200).json({
      message: "User profile fetched successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Forgot Password (shell)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // TODO: Implement email sending logic (e.g., with Nodemailer)
    // Placeholder: Generate a reset token and save it (e.g., in a resetTokens table)
    const resetToken = generateToken({ email }, '15m'); // Short-lived token
    // await prisma.resetToken.create({ data: { email, token: resetToken } });

    return res.status(200).json({ message: 'Reset link sent (placeholder)', token: resetToken });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Reset Password (shell)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // TODO: Verify token and update password
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    // const user = await prisma.user.findUnique({ where: { email: decoded.email } });
    // if (user) {
    //   const hashedPassword = await bcrypt.hash(newPassword, 10);
    //   await prisma.user.update({ where: { email: decoded.email }, data: { password: hashedPassword } });
    // }

    return res.status(200).json({ message: 'Password reset successful (placeholder)' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};