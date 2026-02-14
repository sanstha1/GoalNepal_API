import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET, CLIENT_URL } from "../config/env";
import { sendEmail } from "../config/email";
import { IUser } from "../models/user.model";

const userRepository = new UserRepository();

export class UserService {
  async createUser(data: CreateUserDto) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) throw new HttpError(403, "Email already in use");

    const hashedPassword = await bcryptjs.hash(data.password, 10);
    const { confirmPassword, ...userData } = data;
    userData.password = hashedPassword;

    const newUser = await userRepository.createUser(userData);
    
    const userObject = typeof newUser.toObject === "function" ? newUser.toObject() : newUser;
    const { password, ...userWithoutPassword } = userObject;

    return userWithoutPassword;
  }

  async loginUser(data: LoginUserDto) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) throw new HttpError(404, "User not found");
    if (!user.password) throw new HttpError(500, "User record missing password");

    const isValid = await bcryptjs.compare(data.password, user.password);
    if (!isValid) throw new HttpError(401, "Invalid credentials");

    const payload = { id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return { token, user };
  }

  async getUserById(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");
    return user;
  }

  async updateUser(userId: string, data: UpdateUserDto) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    if (data.email && data.email !== user.email) {
      const emailExists = await userRepository.getUserByEmail(data.email);
      if (emailExists) throw new HttpError(403, "Email already in use");
    }

    if (data.password) {
      data.password = await bcryptjs.hash(data.password, 10);
    }

    const { confirmPassword, ...updateData } = data;
    const updatedUser = await userRepository.updateUser(userId, updateData);
    
    if (!updatedUser) throw new HttpError(404, "User not found");
    
    const userObject = typeof updatedUser.toObject === "function" ? updatedUser.toObject() : updatedUser;
    const { password, ...userWithoutPassword } = userObject;

    return userWithoutPassword;
  }

  async sendResetPasswordEmail(email?: string) {
    if (!email) throw new HttpError(400, "Email is required");

    const user = await userRepository.getUserByEmail(email);
    if (!user) throw new HttpError(404, "User not found");

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
    const html = `
      <p>Hello ${user.fullName || "User"},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetLink}" target="_blank">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
    `;

    try {
      await sendEmail(user.email, "GoalNepal Password Reset", html);
    } catch (err: any) {
      console.error("Email Error:", err);
      throw new HttpError(500, "Failed to send reset email. Check your email configuration.");
    }

    return { message: "Password reset email sent successfully." };
  }

  async resetPassword(token?: string, newPassword?: string) {
    if (!token || !newPassword) throw new HttpError(400, "Token and new password are required");

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;

      const user = await userRepository.getUserById(userId);
      if (!user) throw new HttpError(404, "User not found");

      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      await userRepository.updateUser(userId, { password: hashedPassword });

      return { message: "Password reset successfully." };
    } catch (err) {
      console.error("Reset Password Error:", err);
      throw new HttpError(400, "Invalid or expired token.");
    }
  }

  async logout() {
    return true;
  }

  async getAllUsers(page?: number, size?: number, search?: string): Promise<IUser[]> {
    const result = await userRepository.getAllUsers(page, size, search);
    
    if (Array.isArray(result)) {
      return result;
    }
    
    return result.users;
  }

  async deleteUser(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");
    return await userRepository.deleteUser(userId);
  }
}