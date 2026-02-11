import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { UserModel as User } from "../models/user.model";
import { sendEmail } from "../config/email";

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profilePicture: "default-profile.png",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "JWT secret not configured",
      });
    }

    const options: SignOptions = {
      expiresIn: "7d",
    };

    const token = jwt.sign(
      { id: user._id.toString() },
      secret,
      options
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const sendResetPasswordEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email is registered, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    console.log("Generated reset token:", resetToken);
    console.log("For user:", user.email);
    console.log("User ID:", user._id);

    const verifyUser = await User.findById(user._id);
    console.log("Token saved in DB:", verifyUser?.resetPasswordToken);
    console.log("Expiry time:", new Date(verifyUser?.resetPasswordExpire || 0));

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${user.fullName},</p>
        <p>You requested to reset your password for your GoalNepal account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <p><strong>This link will expire in 15 minutes.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">GoalNepal - Nepal's Home for Football & Futsal Events</p>
      </div>
    `;

    await sendEmail(user.email, "Password Reset - GoalNepal", html);

    console.log("Reset email sent successfully");

    return res.status(200).json({
      success: true,
      message: "Reset link sent to your email",
    });

  } catch (error: any) {
    console.error("Email Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    console.log("Reset password attempt");
    console.log("Received token:", token);
    console.log("Current time:", new Date());

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    console.log("User found:", !!user);

    if (!user) {
      const expiredUser = await User.findOne({ resetPasswordToken: token });
      
      if (expiredUser) {
        console.log("Token expired at:", new Date(expiredUser.resetPasswordExpire || 0));
        return res.status(400).json({
          success: false,
          message: "Token has expired. Please request a new password reset link.",
        });
      }

      console.log("No user found with this token");
      return res.status(400).json({
        success: false,
        message: "Invalid token. Please request a new password reset link.",
      });
    }

    console.log("Valid token found for user:", user.email);

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword) {
      console.log("User tried to use the same password");
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as your current password. Please choose a different password.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    console.log("Password reset successfully for:", user.email);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};