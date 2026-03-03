import { AdminService } from "../../../services/admin/admin.service";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { HttpError } from "../../../errors/http-error";

// Shared repo mock objects referenced by the module factory
const mockAdminRepo = {
  createUser: jest.fn(),
  getUserbyEmail: jest.fn(),
  getUserById: jest.fn(),
  getAllAdmins: jest.fn(),
  updateOneAdmin: jest.fn(),
  deleteOneAdmin: jest.fn(),
};

const mockUserRepo = {
  getUserByEmail: jest.fn(),
};

jest.mock("../../../repositories/admin/admin.repository", () => ({
  AdminRepository: jest.fn().mockImplementation(() => mockAdminRepo),
}));

jest.mock("../../../repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => mockUserRepo),
}));

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("AdminService Unit Tests", () => {
  let adminService: AdminService;

  const fakeAdmin = {
    _id: "admin123",
    email: "admin@test.com",
    fullName: "Admin User",
    password: "hashedpass",
    role: "admin",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    adminService = new AdminService();
  });

  it("1. Should register a new admin successfully", async () => {
    mockUserRepo.getUserByEmail.mockResolvedValue(null);
    mockAdminRepo.getUserbyEmail.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedpass");
    mockAdminRepo.createUser.mockResolvedValue(fakeAdmin);
    const result = await adminService.registerAdmin({ email: "admin@test.com", fullName: "Admin User", password: "password123" });
    expect(result).toEqual(fakeAdmin);
  });

  it("2. Should throw 409 if email in use by user", async () => {
    mockUserRepo.getUserByEmail.mockResolvedValue({ email: "admin@test.com" });
    mockAdminRepo.getUserbyEmail.mockResolvedValue(null);
    await expect(adminService.registerAdmin({ email: "admin@test.com", fullName: "Admin", password: "pass123" })).rejects.toThrow(HttpError);
  });

  it("3. Should throw 409 if email in use by admin", async () => {
    mockUserRepo.getUserByEmail.mockResolvedValue(null);
    mockAdminRepo.getUserbyEmail.mockResolvedValue(fakeAdmin);
    await expect(adminService.registerAdmin({ email: "admin@test.com", fullName: "Admin", password: "pass123" })).rejects.toThrow(HttpError);
  });

  it("4. Should throw 400 if fullName is empty", async () => {
    mockUserRepo.getUserByEmail.mockResolvedValue(null);
    mockAdminRepo.getUserbyEmail.mockResolvedValue(null);
    await expect(adminService.registerAdmin({ email: "admin@test.com", fullName: "", password: "pass123" })).rejects.toThrow(HttpError);
  });

  it("5. Should throw 400 if password too short", async () => {
    mockUserRepo.getUserByEmail.mockResolvedValue(null);
    mockAdminRepo.getUserbyEmail.mockResolvedValue(null);
    await expect(adminService.registerAdmin({ email: "admin@test.com", fullName: "Admin", password: "123" })).rejects.toThrow(HttpError);
  });

  it("6. Should throw 400 if passwords do not match", async () => {
    mockUserRepo.getUserByEmail.mockResolvedValue(null);
    mockAdminRepo.getUserbyEmail.mockResolvedValue(null);
    await expect(adminService.registerAdmin({ email: "admin@test.com", fullName: "Admin", password: "pass123", confirmPassword: "different" } as any)).rejects.toThrow(HttpError);
  });

  it("7. Should login admin successfully", async () => {
    mockAdminRepo.getUserbyEmail.mockResolvedValue(fakeAdmin);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("token123");
    const result = await adminService.loginAdmin({ email: "admin@test.com", password: "password123" });
    expect(result.token).toBe("token123");
    expect(result.admin).toEqual(fakeAdmin);
  });

  it("8. Should throw 404 if admin not found on login", async () => {
    mockAdminRepo.getUserbyEmail.mockResolvedValue(null);
    await expect(adminService.loginAdmin({ email: "x@test.com", password: "pass" })).rejects.toThrow(HttpError);
  });

  it("9. Should throw 401 if password invalid on login", async () => {
    mockAdminRepo.getUserbyEmail.mockResolvedValue(fakeAdmin);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(false);
    await expect(adminService.loginAdmin({ email: "admin@test.com", password: "wrong" })).rejects.toThrow(HttpError);
  });

  it("10. Should get admin by ID", async () => {
    mockAdminRepo.getUserById.mockResolvedValue(fakeAdmin);
    const result = await adminService.getAdminById("admin123");
    expect(result).toEqual(fakeAdmin);
  });

  it("11. Should throw 404 if admin not found by ID", async () => {
    mockAdminRepo.getUserById.mockResolvedValue(null);
    await expect(adminService.getAdminById("bad")).rejects.toThrow(HttpError);
  });

  it("12. Should update admin profile successfully", async () => {
    mockAdminRepo.getUserById.mockResolvedValue(fakeAdmin);
    mockAdminRepo.updateOneAdmin.mockResolvedValue({ ...fakeAdmin, fullName: "Updated" });
    const result = await adminService.updateAdminProfile("admin123", { fullName: "Updated" });
    expect(result?.fullName).toBe("Updated");
  });

  it("13. Should throw 404 if admin not found on update", async () => {
    mockAdminRepo.getUserById.mockResolvedValue(null);
    await expect(adminService.updateAdminProfile("bad", {})).rejects.toThrow(HttpError);
  });

  it("14. Should get all admins", async () => {
    mockAdminRepo.getAllAdmins.mockResolvedValue([fakeAdmin]);
    const result = await adminService.getAllAdmins();
    expect(result).toEqual([fakeAdmin]);
  });

  it("15. Should delete admin successfully", async () => {
    mockAdminRepo.getUserById.mockResolvedValue(fakeAdmin);
    mockAdminRepo.deleteOneAdmin.mockResolvedValue(true);
    const result = await adminService.deleteAdmin("admin123");
    expect(result).toBe(true);
  });

  it("16. Should throw 404 if admin not found on delete", async () => {
    mockAdminRepo.getUserById.mockResolvedValue(null);
    await expect(adminService.deleteAdmin("bad")).rejects.toThrow(HttpError);
  });
});