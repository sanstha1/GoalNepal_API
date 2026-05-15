import { Request, Response, NextFunction } from "express";
import { IUser } from "../../models/user.model";
import { IAdmin } from "../../models/admin/admin.model";
import { UserService } from "../../services/user.services";
import { AdminService } from "../../services/admin/admin.services";

const adminService = new AdminService();
const userService = new UserService();

export class AdminController {
  // ------------------- Admin -------------------
  async registerAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = req.body;
      const newAdmin = await adminService.registerAdmin(validatedData);

      const obj = typeof newAdmin.toObject === "function" ? newAdmin.toObject() : newAdmin;
      const { password, ...adminResponse } = obj;

      res.status(201).json({
        success: true,
        message: "Admin registered successfully",
        data: adminResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async loginAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const loginData = req.body;
      const result = await adminService.loginAdmin(loginData);

      const obj = typeof result.admin.toObject === "function" ? result.admin.toObject() : result.admin;
      const { password, ...adminResponse } = obj;

      res.status(200).json({
        success: true,
        message: "Admin login successful",
        data: {
          token: result.token,
          admin: adminResponse,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user.id;
      const admin = await adminService.getAdminById(adminId);

      if (!admin) {
        return res.status(404).json({ success: false, message: "Admin not found" });
      }

      const obj = typeof admin.toObject === "function" ? admin.toObject() : admin;
      const { password, ...adminResponse } = obj;

      res.status(200).json({
        success: true,
        message: "Admin profile retrieved successfully",
        data: adminResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAdminProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user.id;
      const updateData = req.body;

      if (updateData.password) delete updateData.password;

      const updatedAdmin = await adminService.updateAdminProfile(adminId, updateData);

      if (!updatedAdmin) {
        return res.status(404).json({ success: false, message: "Admin not found" });
      }

      const obj = typeof updatedAdmin.toObject === "function" ? updatedAdmin.toObject() : updatedAdmin;
      const { password, ...adminResponse } = obj;

      res.status(200).json({
        success: true,
        message: "Admin profile updated successfully",
        data: adminResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllAdmins(req: Request, res: Response, next: NextFunction) {
    try {
      const admins = await adminService.getAllAdmins();
      if (!Array.isArray(admins)) return res.json({ success: true, message: "No admins found", data: [] });

      const adminsResponse = admins.map((admin: any) => {
        const obj = typeof admin.toObject === "function" ? admin.toObject() : admin;
        const { password, ...rest } = obj;
        return rest;
      });

      res.status(200).json({
        success: true,
        message: "All admins retrieved successfully",
        data: adminsResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminById(req: Request, res: Response, next: NextFunction) {
    try {
      const { adminId } = req.params;
      const admin = await adminService.getAdminById(adminId);

      if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

      const obj = typeof admin.toObject === "function" ? admin.toObject() : admin;
      const { password, ...adminResponse } = obj;

      res.status(200).json({
        success: true,
        message: "Admin retrieved successfully",
        data: adminResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { adminId } = req.params;
      const result = await adminService.deleteAdmin(adminId);

      res.status(200).json({
        success: true,
        message: "Admin deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ------------------- Users Managed by Admin -------------------
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      if (!Array.isArray(users)) return res.json({ success: true, message: "No users found", data: [] });

      const usersResponse = users.map((user: any) => {
        const obj = typeof user.toObject === "function" ? user.toObject() : user;
        const { password, ...rest } = obj;
        return rest;
      });

      res.status(200).json({
        success: true,
        message: "All users retrieved successfully",
        data: usersResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const user = await userService.getUserById(userId);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      const obj = typeof user.toObject === "function" ? user.toObject() : user;
      const { password, ...userResponse } = obj;

      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: userResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await userService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = req.body;

      // Handle profile picture upload
      if (req.file) {
        userData.profilePicture = req.file.filename;
      }

      const newUser = await userService.createUser(userData);

      if (newUser.profilePicture) {
        newUser.profilePicture = `${req.protocol}://${req.get("host")}/profile_pictures/${newUser.profilePicture}`;
      }

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      if (req.file) {
        updateData.profilePicture = req.file.filename;
      }

      const updatedUser = await userService.updateUser(userId, updateData);
      if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

      if (updatedUser.profilePicture) {
        updatedUser.profilePicture = `${req.protocol}://${req.get("host")}/profile_pictures/${updatedUser.profilePicture}`;
      }

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
}
