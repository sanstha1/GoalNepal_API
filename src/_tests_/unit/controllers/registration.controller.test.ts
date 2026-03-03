import { Request, Response, NextFunction } from "express";
import { registrationController } from "../../../controllers/registration.controllers";
import { registrationService } from "../../../services/registration.services";

jest.mock("../../../services/registration.services");

const mockRegistrationService = registrationService as jest.Mocked<typeof registrationService>;

describe("RegistrationController Unit Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  const fakeRegistration = {
    _id: "reg123",
    tournamentId: "tour123",
    registeredBy: "user123",
    teamName: "GoalNepal FC",
    status: "pending",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, user: { id: "user123" } as any };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("1. registerForTournament - should return 201 on success", async () => {
    req.body = { tournamentId: "tour123", teamName: "GoalNepal FC" };
    mockRegistrationService.registerForTournament = jest.fn().mockResolvedValue(fakeRegistration);
    await registrationController.registerForTournament(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("2. registerForTournament - should return 409 if already registered", async () => {
    mockRegistrationService.registerForTournament = jest.fn().mockRejectedValue(
      new Error("You have already registered for this tournament")
    );
    await registrationController.registerForTournament(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("3. registerForTournament - should call next on other errors", async () => {
    mockRegistrationService.registerForTournament = jest.fn().mockRejectedValue(new Error("other error"));
    await registrationController.registerForTournament(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("4. getMyRegistrations - should return 200 with data", async () => {
    mockRegistrationService.getMyRegistrations = jest.fn().mockResolvedValue([fakeRegistration]);
    await registrationController.getMyRegistrations(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("5. getMyRegistrations - should call next on error", async () => {
    mockRegistrationService.getMyRegistrations = jest.fn().mockRejectedValue(new Error("fail"));
    await registrationController.getMyRegistrations(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("6. getTournamentRegistrations - should return 200 with data", async () => {
    req.params = { tournamentId: "tour123" };
    mockRegistrationService.getTournamentRegistrations = jest.fn().mockResolvedValue([fakeRegistration]);
    await registrationController.getTournamentRegistrations(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("7. getTournamentRegistrations - should call next on error", async () => {
    req.params = { tournamentId: "tour123" };
    mockRegistrationService.getTournamentRegistrations = jest.fn().mockRejectedValue(new Error("fail"));
    await registrationController.getTournamentRegistrations(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});