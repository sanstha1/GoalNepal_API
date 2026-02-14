import { QueryFilter } from "mongoose";
import { IUser, UserModel } from "../models/user.model";

export interface IUserRepository {
  createUser(data: Partial<IUser>): Promise<IUser>;
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserByFullName(fullName: string): Promise<IUser | null>;
  getUserById(id: string): Promise<IUser | null>;
  getAllUsers(
    page?: number,
    size?: number,
    search?: string
  ): Promise<{ users: IUser[]; total: number }>;
  updateUser(id: string, data: Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  async createUser(data: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(data);
    return await user.save();
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async getUserByFullName(fullName: string): Promise<IUser | null> {
    return await UserModel.findOne({ fullName });
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  private escapeRegex(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special regex chars
  }

  async getAllUsers(
    page?: number,
    size?: number,
    search?: string
  ): Promise<{ users: IUser[]; total: number }> {
    const filter: QueryFilter<IUser> = {};

    if (search) {
      const escapedSearch = this.escapeRegex(search);
      filter.$or = [
        { fullName: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const skip = page && size ? (page - 1) * size : 0;
    const limit = size || 0;

    const [users, total] = await Promise.all([
      UserModel.find(filter).skip(skip).limit(limit),
      UserModel.countDocuments(filter),
    ]);

    return { users, total };
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}
