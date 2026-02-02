import z from 'zod'; 

export const UserSchema = z.object({
    fullName: z.string().min(3), 
    email: z.email(), 
    password : z.string().min(6), 
    profilePicture: z.string().url("Invalid URL format").optional(),
    role: z.enum(["user", "admin"]).default("user"),
});

export type UserType = z.infer<typeof UserSchema>;

//espaxi models ma janey ho user.model.ts ma 