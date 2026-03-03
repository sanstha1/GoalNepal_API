import { Request, Response, NextFunction } from "express";
import { tournamentController } from "../../../controllers/tournament.controllers";
import { tournamentService } from "../../../services/tournament.services";

jest.mock("../../../services/tournament.services");

const mockTournamentService = tournamentService as jest.Mocked<typeof tournamentService>;

describe("TournamentController Unit Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  const fakeTournament = {
    _id: "tour123",
    title: "Kathmandu Cup",
    type: "football",
    location: "Kathmandu",
    createdBy: "user123",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, user: { id: "user123" } as any };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("1. createTournament - should return 201 on success", async () => {
    req.body = { title: "Kathmandu Cup", type: "football" };
    (req as any).file = undefined;
    mockTournamentService.createTournament = jest.fn().mockResolvedValue(fakeTournament);
    await tournamentController.createTournament(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("2. createTournament - should call next on error", async () => {
    mockTournamentService.createTournament = jest.fn().mockRejectedValue(new Error("fail"));
    await tournamentController.createTournament(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("3. getTournamentById - should return 200 on success", async () => {
    req.params = { id: "tour123" };
    mockTournamentService.getTournamentById = jest.fn().mockResolvedValue(fakeTournament);
    await tournamentController.getTournamentById(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("4. getTournamentById - should call next on error", async () => {
    req.params = { id: "bad" };
    mockTournamentService.getTournamentById = jest.fn().mockRejectedValue(new Error("not found"));
    await tournamentController.getTournamentById(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("5. getAllTournaments - should return 200 with results", async () => {
    req.query = { page: "1", limit: "10" };
    mockTournamentService.getAllTournaments = jest.fn().mockResolvedValue({ data: [fakeTournament], total: 1, totalPages: 1 });
    await tournamentController.getAllTournaments(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("6. getAllTournaments - should call next on error", async () => {
    mockTournamentService.getAllTournaments = jest.fn().mockRejectedValue(new Error("fail"));
    await tournamentController.getAllTournaments(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("7. getMyTournaments - should return 200 with results", async () => {
    mockTournamentService.getMyTournaments = jest.fn().mockResolvedValue([fakeTournament]);
    await tournamentController.getMyTournaments(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("8. getMyTournaments - should call next on error", async () => {
    mockTournamentService.getMyTournaments = jest.fn().mockRejectedValue(new Error("fail"));
    await tournamentController.getMyTournaments(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("9. updateTournament - should return 200 on success", async () => {
    req.params = { id: "tour123" };
    req.body = { title: "Updated Cup" };
    (req as any).file = undefined;
    mockTournamentService.updateTournament = jest.fn().mockResolvedValue(fakeTournament);
    await tournamentController.updateTournament(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("10. updateTournament - should call next on error", async () => {
    req.params = { id: "bad" };
    mockTournamentService.updateTournament = jest.fn().mockRejectedValue(new Error("fail"));
    await tournamentController.updateTournament(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("11. deleteTournament - should return 200 on success", async () => {
    req.params = { id: "tour123" };
    mockTournamentService.deleteTournament = jest.fn().mockResolvedValue(undefined);
    await tournamentController.deleteTournament(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("12. deleteTournament - should call next on error", async () => {
    req.params = { id: "bad" };
    mockTournamentService.deleteTournament = jest.fn().mockRejectedValue(new Error("fail"));
    await tournamentController.deleteTournament(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});