import { Request, Response } from "express";
import { UserModel as User } from "../models/user.model";
import path from "path";
import fs from "fs";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
  file?: Express.Multer.File;
}

export const uploadProfilePicture = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Please upload an image" 
      });
    }

    const userId = req.params.userId;
    
    // Use findByIdAndUpdate with validateBeforeSave: false to avoid validation errors
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: req.file.filename },
      { new: true, runValidators: false } // ← This prevents validation
    );

    if (!user) {
      // Delete uploaded file if user not found
      const uploadedFilePath = path.join(
        __dirname,
        "../public/profile_pictures",
        req.file.filename
      );
      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
      
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Delete old profile picture if it exists
    if (
      user.profilePicture &&
      user.profilePicture !== "default-profile.png" &&
      user.profilePicture !== req.file.filename
    ) {
      const oldImagePath = path.join(
        __dirname,
        "../public/profile_pictures",
        user.profilePicture
      );

      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (err) {
          console.error("Error deleting old profile picture:", err);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: {
        _id: user._id,
        fullName: user.fullName || user.fullname, // Handle both cases
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      const uploadedFilePath = path.join(
        __dirname,
        "../public/profile_pictures",
        req.file.filename
      );
      if (fs.existsSync(uploadedFilePath)) {
        try {
          fs.unlinkSync(uploadedFilePath);
        } catch (err) {
          console.error("Error cleaning up file:", err);
        }
      }
    }
    
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { profilePicture } = req.body as {
      profilePicture: string;
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture },
      { new: true, runValidators: false } // Prevent validation on partial update
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        _id: user._id,
        fullName: user.fullName || user.fullname, // Handle both cases
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getMyProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        _id: user._id,
        fullName: user.fullName || user.fullname, // Handle both cases
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: {
        _id: user._id,
        fullName: user.fullName || user.fullname, // Handle both cases
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};