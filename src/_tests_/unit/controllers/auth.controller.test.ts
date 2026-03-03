import { Request, Response } from "express";
import { register, login, sendResetPasswordEmail, resetPassword } from "../../../controllers/auth.controllers";
import { UserModel } from "../../../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as emailConfig from "../../../config/email";

jest.mock("../../../models/user.model");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../../config/email");

describe("Auth Controller Unit Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  const fakeUser = {
    _id: "user123",
    fullName: "Test User",
    email: "test@test.com",
    password: "hashedpass",
    profilePicture: "default-profile.png",
    role: "user",
    resetPasswordToken: undefined as any,
    resetPasswordExpire: undefined as any,
    save: jest.fn().mockResolvedValue(true),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it("register - success", async () => {
    req.body = { fullName: "Test User", email: "test@test.com", password: "pass123" };
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpass");
    (UserModel.create as jest.Mock).mockResolvedValue(fakeUser);

    await register(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("register - missing fields", async () => {
    req.body = { email: "test@test.com" };
    await register(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("register - email in use", async () => {
    req.body = { fullName: "Test", email: "test@test.com", password: "pass123" };
    (UserModel.findOne as jest.Mock).mockResolvedValue(fakeUser);
    await register(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("login - success", async () => {
    req.body = { email: "test@test.com", password: "pass123" };
    (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    process.env.JWT_SECRET = "testsecret";
    (jwt.sign as jest.Mock).mockReturnValue("token123");

    await login(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("login - missing fields", async () => {
    req.body = { email: "test@test.com" };
    await login(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("login - user not found", async () => {
    req.body = { email: "test@test.com", password: "pass" };
    (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await login(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("login - invalid password", async () => {
    req.body = { email: "test@test.com", password: "wrong" };
    (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await login(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("login - JWT_SECRET missing", async () => {
    req.body = { email: "test@test.com", password: "pass123" };
    (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const original = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    await login(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    process.env.JWT_SECRET = original;
  });

  it("sendResetPasswordEmail - no email", async () => {
    req.body = {};
    await sendResetPasswordEmail(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sendResetPasswordEmail - user not found", async () => {
    req.body = { email: "notexist@test.com" };
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);
    await sendResetPasswordEmail(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("sendResetPasswordEmail - success", async () => {
    req.body = { email: "test@test.com" };
    const userWithSave = { ...fakeUser, save: jest.fn().mockResolvedValue(true) };
    (UserModel.findOne as jest.Mock).mockResolvedValue(userWithSave);
    (emailConfig.sendEmail as jest.Mock).mockResolvedValue(true);

    await sendResetPasswordEmail(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("resetPassword - no newPassword", async () => {
    req.params = { token: "sometoken" };
    req.body = {};
    await resetPassword(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("resetPassword - invalid token", async () => {
    req.params = { token: "badtoken" };
    req.body = { newPassword: "newpass123" };
    (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await resetPassword(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("resetPassword - expired token", async () => {
    req.params = { token: "expiredtoken" };
    req.body = { newPassword: "newpass123" };
    const expiredUser = { ...fakeUser, resetPasswordToken: "expiredtoken", resetPasswordExpire: Date.now() - 10000 };
    (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(expiredUser) });
    await resetPassword(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("resetPassword - same password", async () => {
    req.params = { token: "validtoken" };
    req.body = { newPassword: "samepass" };
    const validUser = { ...fakeUser, resetPasswordToken: "validtoken", resetPasswordExpire: Date.now() + 900000 };
    (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(validUser) });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    await resetPassword(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("resetPassword - success", async () => {
    req.params = { token: "validtoken" };
    req.body = { newPassword: "newpass123" };
    const validUser = { ...fakeUser, resetPasswordToken: "validtoken", resetPasswordExpire: Date.now() + 900000, password: "oldhashed" };
    (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(validUser) });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    (bcrypt.hash as jest.Mock).mockResolvedValue("newhash");

    await resetPassword(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});