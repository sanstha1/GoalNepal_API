import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

const userRepository = new UserRepository();

export class UserService {
    getAllUsers() {
        throw new Error("Method not implemented.");
    }
    deleteUser(userId: string) {
        throw new Error("Method not implemented.");
    }
    
    // Fully implemented Update method
    async updateUser(userId: string, updatePayload: Partial<UpdateUserDto> & { profilePicture?: string }) {
        const user = await userRepository.getUserbyId(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // If password is being updated, hash it
        if (updatePayload.password) {
            updatePayload.password = await bcryptjs.hash(updatePayload.password, 10);
        }

        const updatedUser = await userRepository.updateUser(userId, updatePayload);
        
        if (!updatedUser) {
            throw new HttpError(500, "Failed to update user");
        }

        return updatedUser;
    }

    async registerUser(data: CreateUserDto) {
        const checkEmail = await userRepository.getUserbyEmail(data.email);
        if (checkEmail) {
            throw new HttpError(403, "Email already in use");
        }

        const hashedPassword = await bcryptjs.hash(data.password, 10);

        // Destructure to remove confirmPassword and keep the rest (fullName, email, etc.)
        const { confirmPassword, ...userData } = data;

        return await userRepository.createUser({
            ...userData,
            password: hashedPassword,
        });
    }

    async LoginUser(data: LoginUserDto) {
        const existingUser = await userRepository.getUserbyEmail(data.email);

        if (!existingUser) {
            throw new HttpError(404, "User not found");
        }

        if (!existingUser.password) {
            throw new HttpError(500, "User record missing password");
        }

        const isPasswordValid = await bcryptjs.compare(
            data.password,
            existingUser.password
        );

        if (!isPasswordValid) {
            throw new HttpError(401, "Invalid credentials");
        }

        const payload = {
            id: existingUser._id,
            email: existingUser.email,
            role: existingUser.role,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

        return { token, existingUser };
    }

    async getUserById(userId: string) {
        const user = await userRepository.getUserbyId(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }
}