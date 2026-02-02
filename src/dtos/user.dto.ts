import { z } from "zod";

// Base user schema to reuse in multiple DTOs
export const UserSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profilePicture: z.string().url("Invalid URL format").optional().nullable(),
  role: z.enum(["user", "admin"]).optional().default("user"),
  imageUrl: z.string().optional().nullable(),
});

// CREATE USER DTO
export const CreateUserDto = UserSchema.pick({
  fullName: true,
  email: true,
  password: true,
}).extend({
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type CreateUserDto = z.infer<typeof CreateUserDto>;

// LOGIN DTO
export const LoginUserDto = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password is required"),
});

export type LoginUserDto = z.infer<typeof LoginUserDto>;

// UPDATE USER DTO
// Use partial() so all fields are optional for updates
export const UpdateUserDto = UserSchema.partial().extend({
  confirmPassword: z.string().min(6, "Confirm password is required").optional(),
}).refine(
  (data) => !data.confirmPassword || data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type UpdateUserDto = z.infer<typeof UpdateUserDto>;
