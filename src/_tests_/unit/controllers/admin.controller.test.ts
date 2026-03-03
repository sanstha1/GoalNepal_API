import { Request, Response, NextFunction } from "express";
import { AdminController } from "../../../controllers/admin/admin.controller";

// Shared mock objects — defined at module scope but populated inside factory via closure
const mockAdminService = {
  registerAdmin: jest.fn(),
  loginAdmin: jest.fn(),
  getAdminById: jest.fn(),
  updateAdminProfile: jest.fn(),
  getAllAdmins: jest.fn(),
  deleteAdmin: jest.fn(),
};

const mockUserService = {
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  deleteUser: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
};

// jest.mock is hoisted, but object LITERALS with jest.fn() inside are fine
jest.mock("../../../services/admin/admin.service", () => ({
  AdminService: jest.fn().mockImplementation(() => mockAdminService),
}));

jest.mock("../../../services/user.services", () => ({
  UserService: jest.fn().mockImplementation(() => mockUserService),
}));

describe("AdminController Unit Tests", () => {
  let adminController: AdminController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  const fakeAdminDoc = {
    _id: "admin123",
    email: "admin@test.com",
    fullName: "Admin User",
    password: "hashed",
    role: "admin",
    toObject: function () {
      return { _id: "admin123", email: "admin@test.com", fullName: "Admin User", role: "admin" };
    },
  } as any;

  const fakeUserDoc = {
    _id: "user123",
    email: "user@test.com",
    fullName: "User One",
    password: "hashed",
    role: "user",
    toObject: function () {
      return { _id: "user123", email: "user@test.com", fullName: "User One", role: "user" };
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    adminController = new AdminController();
    req = { body: {}, params: {}, protocol: "http", get: jest.fn().mockReturnValue("localhost") };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("1. registerAdmin - should return 201 on success", async () => {
    mockAdminService.registerAdmin.mockResolvedValue(fakeAdminDoc);
    await adminController.registerAdmin(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("2. registerAdmin - should call next on error", async () => {
    mockAdminService.registerAdmin.mockRejectedValue(new Error("fail"));
    await adminController.registerAdmin(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("3. loginAdmin - should return 200 on success", async () => {
    mockAdminService.loginAdmin.mockResolvedValue({ token: "tok", admin: fakeAdminDoc });
    await adminController.loginAdmin(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("4. loginAdmin - should call next on error", async () => {
    mockAdminService.loginAdmin.mockRejectedValue(new Error("fail"));
    await adminController.loginAdmin(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("5. getAdminProfile - should return 200 on success", async () => {
    (req as any).user = { id: "admin123" };
    mockAdminService.getAdminById.mockResolvedValue(fakeAdminDoc);
    await adminController.getAdminProfile(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("6. getAdminProfile - should return 404 if not found", async () => {
    (req as any).user = { id: "admin123" };
    mockAdminService.getAdminById.mockResolvedValue(null);
    await adminController.getAdminProfile(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("7. updateAdminProfile - should return 200 on success", async () => {
    (req as any).user = { id: "admin123" };
    req.body = { fullName: "Updated" };
    mockAdminService.updateAdminProfile.mockResolvedValue(fakeAdminDoc);
    await adminController.updateAdminProfile(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("8. updateAdminProfile - should return 404 if not found", async () => {
    (req as any).user = { id: "admin123" };
    req.body = {};
    mockAdminService.updateAdminProfile.mockResolvedValue(null);
    await adminController.updateAdminProfile(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("9. getAllAdmins - should return 200 with admins", async () => {
    mockAdminService.getAllAdmins.mockResolvedValue([fakeAdminDoc]);
    await adminController.getAllAdmins(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("10. getAllAdmins - should handle non-array result", async () => {
    mockAdminService.getAllAdmins.mockResolvedValue(null);
    await adminController.getAllAdmins(req as Request, res as Response, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: [] }));
  });

  it("11. getAdminById - should return 200 on success", async () => {
    req.params = { adminId: "admin123" };
    mockAdminService.getAdminById.mockResolvedValue(fakeAdminDoc);
    await adminController.getAdminById(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("12. getAdminById - should return 404 if not found", async () => {
    req.params = { adminId: "bad" };
    mockAdminService.getAdminById.mockResolvedValue(null);
    await adminController.getAdminById(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("13. deleteAdmin - should return 200 on success", async () => {
    req.params = { adminId: "admin123" };
    mockAdminService.deleteAdmin.mockResolvedValue(true);
    await adminController.deleteAdmin(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("14. deleteAdmin - should call next on error", async () => {
    req.params = { adminId: "admin123" };
    mockAdminService.deleteAdmin.mockRejectedValue(new Error("fail"));
    await adminController.deleteAdmin(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("15. getAllUsers - should return 200 with users", async () => {
    mockUserService.getAllUsers.mockResolvedValue([fakeUserDoc]);
    await adminController.getAllUsers(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("16. getAllUsers - should handle non-array result", async () => {
    mockUserService.getAllUsers.mockResolvedValue(null);
    await adminController.getAllUsers(req as Request, res as Response, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: [] }));
  });

  it("17. getUserById - should return 200 on success", async () => {
    req.params = { userId: "user123" };
    mockUserService.getUserById.mockResolvedValue(fakeUserDoc);
    await adminController.getUserById(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("18. getUserById - should return 404 if not found", async () => {
    req.params = { userId: "bad" };
    mockUserService.getUserById.mockResolvedValue(null);
    await adminController.getUserById(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("19. deleteUser - should return 200 on success", async () => {
    req.params = { userId: "user123" };
    mockUserService.deleteUser.mockResolvedValue(true);
    await adminController.deleteUser(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("20. deleteUser - should call next on error", async () => {
    req.params = { userId: "user123" };
    mockUserService.deleteUser.mockRejectedValue(new Error("fail"));
    await adminController.deleteUser(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("21. createUser - should return 201 on success", async () => {
    req.body = { fullName: "New User", email: "new@test.com", password: "pass123" };
    (req as any).file = undefined;
    mockUserService.createUser.mockResolvedValue({ ...fakeUserDoc, profilePicture: undefined });
    await adminController.createUser(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("22. createUser - should set profilePicture from file", async () => {
    req.body = { fullName: "New", email: "new@test.com", password: "pass" };
    (req as any).file = { filename: "pic.png" };
    mockUserService.createUser.mockResolvedValue({ ...fakeUserDoc, profilePicture: "pic.png" });
    await adminController.createUser(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("23. createUser - should call next on error", async () => {
    req.body = {};
    (req as any).file = undefined;
    mockUserService.createUser.mockRejectedValue(new Error("fail"));
    await adminController.createUser(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("24. updateUser - should return 200 on success", async () => {
    req.params = { userId: "user123" };
    req.body = { fullName: "Updated" };
    (req as any).file = undefined;
    mockUserService.updateUser.mockResolvedValue({ ...fakeUserDoc });
    await adminController.updateUser(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("25. updateUser - should return 404 if not found", async () => {
    req.params = { userId: "bad" };
    req.body = {};
    (req as any).file = undefined;
    mockUserService.updateUser.mockResolvedValue(null);
    await adminController.updateUser(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("26. updateUser - should call next on error", async () => {
    req.params = { userId: "user123" };
    req.body = {};
    (req as any).file = undefined;
    mockUserService.updateUser.mockRejectedValue(new Error("fail"));
    await adminController.updateUser(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});