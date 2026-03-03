import { Request, Response, NextFunction } from "express";
import { authorizedMiddleware, isAdmin } from "../../../middlewares/authorization.middlewares";
import jwt from "jsonwebtoken";
import { UserModel } from "../../../models/user.model";
import { AdminModel } from "../../../models/admin/admin.model";

jest.mock("jsonwebtoken");
jest.mock("../../../models/user.model");
jest.mock("../../../models/admin/admin.model");
jest.mock("../../../config/env", () => ({ JWT_SECRET: "test-secret" }));

const mockRequest = (headers = {}, user?: any) =>
  ({ headers, user } as unknown as Request);

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const next: NextFunction = jest.fn();

const fakeUser = { _id: "user123", role: "user" };
const fakeAdmin = { _id: "admin123", role: "admin" };

describe("Authorization Middleware Unit Tests", () => {
  beforeEach(() => jest.clearAllMocks());

  it("1. Should return 401 if no Authorization header", async () => {
    const req = mockRequest({});
    const res = mockResponse();
    await authorizedMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
  });

  it("2. Should return 401 if Authorization header does not start with Bearer", async () => {
    const req = mockRequest({ authorization: "Basic sometoken" });
    const res = mockResponse();
    await authorizedMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("3. Should return 401 if token is invalid", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error("invalid"); });
    const req = mockRequest({ authorization: "Bearer badtoken" });
    const res = mockResponse();
    await authorizedMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });

  it("4. Should return 401 if decoded token has no id", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({});
    const req = mockRequest({ authorization: "Bearer token" });
    const res = mockResponse();
    await authorizedMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("5. Should return 401 if user no longer exists", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });
    (AdminModel.findById as jest.Mock).mockResolvedValue(null);
    (UserModel.findById as jest.Mock).mockResolvedValue(null);
    const req = mockRequest({ authorization: "Bearer token" });
    const res = mockResponse();
    await authorizedMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "User no longer exists" });
  });

  it("6. Should call next() and set req.user for valid regular user token", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user123", role: "user" });
    (AdminModel.findById as jest.Mock).mockResolvedValue(null);
    (UserModel.findById as jest.Mock).mockResolvedValue(fakeUser);
    const req = mockRequest({ authorization: "Bearer validtoken" });
    const res = mockResponse();
    await authorizedMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.role).toBe("user");
  });

  it("7. Should call next() and set req.isAdmin=true for admin user", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "admin123", role: "admin" });
    (AdminModel.findById as jest.Mock).mockResolvedValue(fakeAdmin);
    const req = mockRequest({ authorization: "Bearer admintoken" });
    const res = mockResponse();
    await authorizedMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.isAdmin).toBe(true);
    expect(req.user.role).toBe("admin");
  });

  it("8. Should set isAdmin=true if user model role is admin", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });
    (AdminModel.findById as jest.Mock).mockResolvedValue(null);
    (UserModel.findById as jest.Mock).mockResolvedValue({ ...fakeUser, role: "admin" });
    const req = mockRequest({ authorization: "Bearer token" });
    const res = mockResponse();
    await authorizedMiddleware(req, res, next);
    expect(req.isAdmin).toBe(true);
  });

  it("9. Should call next() if user is admin", () => {
    const req = mockRequest({}, { role: "admin" });
    const res = mockResponse();
    isAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("10. Should return 403 if user is not admin", () => {
    const req = mockRequest({}, { role: "user" });
    const res = mockResponse();
    isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Forbidden: Admin access required" })
    );
  });

  it("11. Should return 403 if req.user is undefined", () => {
    const req = mockRequest({});
    const res = mockResponse();
    isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});