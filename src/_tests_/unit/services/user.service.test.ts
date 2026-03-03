import { UserService } from "../../../services/user.services";
import { UserRepository } from "../../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { HttpError } from "../../../errors/http-error";

jest.mock("../../../repositories/user.repository");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../../config/env", () => ({
  JWT_SECRET: "test-secret",
  CLIENT_URL: "http://localhost:3000",
}));
jest.mock("../../../config/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

const mockRepo = UserRepository.prototype;

describe("UserService Unit Tests", () => {
  let userService: UserService;

  const fakeUser = {
    _id: "user123",
    fullName: "Test User",
    email: "test@test.com",
    password: "hashedpassword",
    role: "user",
    toObject: function () {
      return {
        _id: this._id,
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        role: this.role,
      };
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
  });

  it("1. Should create a new user successfully", async () => {
    jest.spyOn(mockRepo, "getUserByEmail").mockResolvedValue(null);
    jest.spyOn(mockRepo, "createUser").mockResolvedValue(fakeUser as any);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedpassword");

    const result = await userService.createUser({
      fullName: "Test User",
      email: "test@test.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.email).toBe("test@test.com");
    expect(result).not.toHaveProperty("password");
  });

  it("2. Should throw 403 if email already in use", async () => {
    jest.spyOn(mockRepo, "getUserByEmail").mockResolvedValue(fakeUser as any);

    await expect(
      userService.createUser({
        fullName: "Test",
        email: "test@test.com",
        password: "pass",
        confirmPassword: "pass",
      })
    ).rejects.toThrow(HttpError);
  });

  it("3. Should login user and return token", async () => {
    jest.spyOn(mockRepo, "getUserByEmail").mockResolvedValue(fakeUser as any);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mock-token");

    const result = await userService.loginUser({
      email: "test@test.com",
      password: "password123",
    });

    expect(result.token).toBe("mock-token");
    expect(result.user).toBeDefined();
  });

  it("4. Should throw 404 if user not found on login", async () => {
    jest.spyOn(mockRepo, "getUserByEmail").mockResolvedValue(null);

    await expect(
      userService.loginUser({ email: "no@test.com", password: "pass" })
    ).rejects.toThrow(HttpError);
  });

  it("5. Should throw 401 for invalid password", async () => {
    jest.spyOn(mockRepo, "getUserByEmail").mockResolvedValue(fakeUser as any);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      userService.loginUser({ email: "test@test.com", password: "wrongpass" })
    ).rejects.toThrow(HttpError);
  });

  it("6. Should return user by ID", async () => {
    jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser as any);

    const result = await userService.getUserById("user123");
    expect(result.email).toBe("test@test.com");
  });

  it("7. Should throw 404 if user not found by ID", async () => {
    jest.spyOn(mockRepo, "getUserById").mockResolvedValue(null);

    await expect(userService.getUserById("fakeid")).rejects.toThrow(HttpError);
  });

  it("8. Should update user successfully", async () => {
    jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser as any);
    jest.spyOn(mockRepo, "getUserByEmail").mockResolvedValue(null);
    jest.spyOn(mockRepo, "updateUser").mockResolvedValue(fakeUser as any);

    const result = await userService.updateUser("user123", { fullName: "Updated Name" });
    expect(result).not.toHaveProperty("password");
  });

  it("9. Should throw 403 if new email already in use by another user", async () => {
    const otherUser = { ...fakeUser, _id: "other123", email: "taken@test.com" };
    jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser as any);
    jest.spyOn(mockRepo, "getUserByEmail").mockResolvedValue(otherUser as any);

    await expect(
      userService.updateUser("user123", { email: "taken@test.com" })
    ).rejects.toThrow(HttpError);
  });

  it("10. Should hash password when updating", async () => {
    jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser as any);
    jest.spyOn(mockRepo, "getUserByEmail").mockResolvedValue(null);
    jest.spyOn(mockRepo, "updateUser").mockResolvedValue(fakeUser as any);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("newhashed");

    await userService.updateUser("user123", { password: "newpassword" });
    expect(bcryptjs.hash).toHaveBeenCalledWith("newpassword", 10);
  });

  it("11. Should send reset password email", async () => {
    jest.spyOn(mockRepo, "getUserByEmail").mockResolvedValue(fakeUser as any);
    (jwt.sign as jest.Mock).mockReturnValue("reset-token");

    const result = await userService.sendResetPasswordEmail("test@test.com");
    expect(result.message).toContain("sent successfully");
  });

  it("12. Should throw 400 if email not provided for reset", async () => {
    await expect(userService.sendResetPasswordEmail(undefined)).rejects.toThrow(HttpError);
  });

  it("13. Should throw 404 if email not found for reset", async () => {
    jest.spyOn(mockRepo, "getUserByEmail").mockResolvedValue(null);
    await expect(userService.sendResetPasswordEmail("no@test.com")).rejects.toThrow(HttpError);
  });

  it("14. Should reset password with valid token", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });
    jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser as any);
    jest.spyOn(mockRepo, "updateUser").mockResolvedValue(fakeUser as any);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("newhashed");

    const result = await userService.resetPassword("valid-token", "newpassword");
    expect(result.message).toContain("successfully");
  });

  it("15. Should throw 400 if token is missing for reset", async () => {
    await expect(userService.resetPassword(undefined, "newpass")).rejects.toThrow(HttpError);
  });

  it("16. Should throw 400 if token is invalid or expired", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error("expired"); });
    await expect(userService.resetPassword("bad-token", "newpass")).rejects.toThrow(HttpError);
  });

  it("17. Should delete user successfully", async () => {
    jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser as any);
    jest.spyOn(mockRepo, "deleteUser").mockResolvedValue(true);

    const result = await userService.deleteUser("user123");
    expect(result).toBe(true);
  });

  it("18. Should throw 404 when deleting non-existing user", async () => {
    jest.spyOn(mockRepo, "getUserById").mockResolvedValue(null);
    await expect(userService.deleteUser("fakeid")).rejects.toThrow(HttpError);
  });

  it("19. Should return all users", async () => {
    jest.spyOn(mockRepo, "getAllUsers").mockResolvedValue({ users: [fakeUser as any], total: 1 });
    const result = await userService.getAllUsers();
    expect(result.length).toBe(1);
  });

  it("20. Should return true on logout", async () => {
    const result = await userService.logout();
    expect(result).toBe(true);
  });
});