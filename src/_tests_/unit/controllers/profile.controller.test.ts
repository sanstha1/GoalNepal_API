import { Request, Response } from "express";
import { uploadProfilePicture, updateUser, getMyProfile, getUserById } from "../../../controllers/profile_controller";
import { UserModel } from "../../../models/user.model";
import path from "path";
import fs from "fs";

jest.mock("../../../models/user.model");
jest.mock("fs");

describe("Profile Controller Unit Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  const fakeUser = {
    _id: "user123",
    fullName: "Test User",
    email: "test@test.com",
    profilePicture: "old-pic.png",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it("1. uploadProfilePicture - should return 400 if no file", async () => {
    (req as any).file = undefined;
    await uploadProfilePicture(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("2. uploadProfilePicture - should return 404 if user not found", async () => {
    req.params = { userId: "user123" };
    (req as any).file = { filename: "new-pic.png" };
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    await uploadProfilePicture(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("3. uploadProfilePicture - should return 200 on success", async () => {
    req.params = { userId: "user123" };
    (req as any).file = { filename: "new-pic.png" };
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...fakeUser, profilePicture: "new-pic.png" });
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    await uploadProfilePicture(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("4. uploadProfilePicture - should delete old picture if exists", async () => {
    req.params = { userId: "user123" };
    (req as any).file = { filename: "new-pic.png" };
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...fakeUser, profilePicture: "old-pic.png" });
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);
    await uploadProfilePicture(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("5. updateUser - should return 404 if user not found", async () => {
    req.params = { userId: "user123" };
    req.body = { profilePicture: "pic.png" };
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
    await updateUser(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("6. updateUser - should return 200 on success", async () => {
    req.params = { userId: "user123" };
    req.body = { profilePicture: "pic.png" };
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(fakeUser);
    await updateUser(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("7. getMyProfile - should return 404 if user not found", async () => {
    (req as any).user = { id: "user123" };
    (UserModel.findById as jest.Mock).mockResolvedValue(null);
    await getMyProfile(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("8. getMyProfile - should return 200 on success", async () => {
    (req as any).user = { id: "user123" };
    (UserModel.findById as jest.Mock).mockResolvedValue(fakeUser);
    await getMyProfile(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("9. getUserById - should return 404 if user not found", async () => {
    req.params = { userId: "user123" };
    (UserModel.findById as jest.Mock).mockResolvedValue(null);
    await getUserById(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("10. getUserById - should return 200 on success", async () => {
    req.params = { userId: "user123" };
    (UserModel.findById as jest.Mock).mockResolvedValue(fakeUser);
    await getUserById(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});