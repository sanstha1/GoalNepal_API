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
  ): Promise<IUser[] | { users: IUser[]; total: number }>;
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

  async getAllUsers(
    page?: number,
    size?: number,
    search?: string
  ): Promise<IUser[] | { users: IUser[]; total: number }> {
    if (!page || !size) {
      const filter: QueryFilter<IUser> = {};
      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      return await UserModel.find(filter);
    }

    const filter: QueryFilter<IUser> = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * size;

    const [users, total] = await Promise.all([
      UserModel.find(filter).skip(skip).limit(size),
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