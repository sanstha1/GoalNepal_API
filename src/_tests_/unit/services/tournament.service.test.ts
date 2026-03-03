import { tournamentService } from "../../../services/tournament.services";
import { tournamentRepository } from "../../../repositories/tournament.repository";
import { HttpError } from "../../../errors/http-error";
import fs from "fs";

jest.mock("../../../repositories/tournament.repository");
jest.mock("fs");

const mockTournament = {
  _id: "tour123",
  title: "Kathmandu Cup",
  type: "football" as const,
  location: "Kathmandu",
  startDate: new Date("2025-08-01"),
  endDate: new Date("2025-08-15"),
  createdBy: { toString: () => "user123" },
  bannerImage: "tournament_banners/banner.png",
};

const mockRepo = tournamentRepository as jest.Mocked<typeof tournamentRepository>;

describe("TournamentService Unit Tests", () => {
  beforeEach(() => jest.clearAllMocks());

  it("1. Should create a tournament successfully", async () => {
    mockRepo.create.mockResolvedValue(mockTournament as any);
    const result = await tournamentService.createTournament(
      { title: "Kathmandu Cup", type: "football", location: "Kathmandu", startDate: "2025-08-01", endDate: "2025-08-15", maxTeams: 16, description: "Test" },
      "user123"
    );
    expect(result.title).toBe("Kathmandu Cup");
  });

  it("2. Should throw 400 if startDate >= endDate", async () => {
    await expect(
      tournamentService.createTournament(
        { title: "Bad Dates", type: "football", location: "Kathmandu", startDate: "2025-08-15", endDate: "2025-08-01", maxTeams: 8, description: "Test" },
        "user123"
      )
    ).rejects.toThrow(HttpError);
  });

  it("3. Should use bannerFile filename when provided", async () => {
    mockRepo.create.mockResolvedValue(mockTournament as any);
    const fakeFile = { filename: "banner.png" } as Express.Multer.File;
    await tournamentService.createTournament(
      { title: "Cup", type: "football", location: "KTM", startDate: "2025-08-01", endDate: "2025-08-15", maxTeams: 8, description: "Test" },
      "user123",
      fakeFile
    );
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ bannerImage: "tournament_banners/banner.png" })
    );
  });

  it("4. Should use bannerUrl when no file is provided", async () => {
    mockRepo.create.mockResolvedValue(mockTournament as any);
    await tournamentService.createTournament(
      { title: "Cup", type: "football", location: "KTM", startDate: "2025-08-01", endDate: "2025-08-15", maxTeams: 8, description: "Test" },
      "user123",
      undefined,
      "https://example.com/banner.png"
    );
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ bannerImage: "https://example.com/banner.png" })
    );
  });

  it("5. Should create tournament with no banner when neither file nor url provided", async () => {
    mockRepo.create.mockResolvedValue(mockTournament as any);
    await tournamentService.createTournament(
      { title: "Cup", type: "football", location: "KTM", startDate: "2025-08-01", endDate: "2025-08-15" },
      "user123"
    );
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ bannerImage: undefined })
    );
  });

  it("6. Should return tournament by ID", async () => {
    mockRepo.findById.mockResolvedValue(mockTournament as any);
    const result = await tournamentService.getTournamentById("tour123");
    expect(result.title).toBe("Kathmandu Cup");
  });

  it("7. Should throw 404 if tournament not found by ID", async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(tournamentService.getTournamentById("fakeid")).rejects.toThrow(HttpError);
  });

  it("8. Should return paginated tournaments", async () => {
    mockRepo.findAll.mockResolvedValue({ data: [mockTournament as any], total: 1, page: 1, limit: 10, totalPages: 1 });
    const result = await tournamentService.getAllTournaments({ page: 1, limit: 10 });
    expect(result.data.length).toBe(1);
  });

  it("9. Should return tournaments created by user", async () => {
    mockRepo.findByCreatedBy.mockResolvedValue([mockTournament as any]);
    const result = await tournamentService.getMyTournaments("user123");
    expect(result.length).toBe(1);
  });

  it("10. Should update tournament successfully", async () => {
    mockRepo.findById.mockResolvedValue(mockTournament as any);
    mockRepo.update.mockResolvedValue({ ...mockTournament, title: "Updated Cup" } as any);
    const result = await tournamentService.updateTournament("tour123", { title: "Updated Cup" }, "user123");
    expect(result.title).toBe("Updated Cup");
  });

  it("11. Should throw 404 if tournament not found on update", async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      tournamentService.updateTournament("fakeid", { title: "Test" }, "user123")
    ).rejects.toThrow(HttpError);
  });

  it("12. Should throw 403 if user is not the creator on update", async () => {
    mockRepo.findById.mockResolvedValue({ ...mockTournament, createdBy: { toString: () => "otheruser" } } as any);
    await expect(
      tournamentService.updateTournament("tour123", { title: "Test" }, "user123")
    ).rejects.toThrow(HttpError);
  });

  it("13. Should throw 400 if updated dates are invalid", async () => {
    mockRepo.findById.mockResolvedValue(mockTournament as any);
    await expect(
      tournamentService.updateTournament("tour123", { startDate: "2025-08-15", endDate: "2025-08-01" }, "user123")
    ).rejects.toThrow(HttpError);
  });

  it("14. Should delete old local banner file on update with new file", async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockImplementation(() => {});
    mockRepo.findById.mockResolvedValue(mockTournament as any);
    mockRepo.update.mockResolvedValue(mockTournament as any);
    const fakeFile = { filename: "newbanner.png" } as Express.Multer.File;
    await tournamentService.updateTournament("tour123", {}, "user123", fakeFile);
    expect(fs.unlinkSync).toHaveBeenCalled();
  });

  it("15. Should not delete old file if bannerImage is a URL on update", async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockImplementation(() => {});
    mockRepo.findById.mockResolvedValue({ ...mockTournament, bannerImage: "https://example.com/old.png" } as any);
    mockRepo.update.mockResolvedValue(mockTournament as any);
    const fakeFile = { filename: "newbanner.png" } as Express.Multer.File;
    await tournamentService.updateTournament("tour123", {}, "user123", fakeFile);
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it("16. Should update with bannerUrl when no file provided", async () => {
    mockRepo.findById.mockResolvedValue(mockTournament as any);
    mockRepo.update.mockResolvedValue(mockTournament as any);
    await tournamentService.updateTournament("tour123", {}, "user123", undefined, "https://example.com/new.png");
    expect(mockRepo.update).toHaveBeenCalledWith(
      "tour123",
      expect.objectContaining({ bannerImage: "https://example.com/new.png" })
    );
  });

  it("17. Should throw 500 if update returns null", async () => {
    mockRepo.findById.mockResolvedValue(mockTournament as any);
    mockRepo.update.mockResolvedValue(null);
    await expect(
      tournamentService.updateTournament("tour123", { title: "Test" }, "user123")
    ).rejects.toThrow(HttpError);
  });

  it("18. Should delete tournament successfully", async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    mockRepo.findById.mockResolvedValue(mockTournament as any);
    mockRepo.delete.mockResolvedValue(mockTournament as any);
    await expect(tournamentService.deleteTournament("tour123", "user123")).resolves.not.toThrow();
  });

  it("19. Should throw 404 if tournament not found on delete", async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(tournamentService.deleteTournament("fakeid", "user123")).rejects.toThrow(HttpError);
  });

  it("20. Should throw 403 if user is not creator on delete", async () => {
    mockRepo.findById.mockResolvedValue({ ...mockTournament, createdBy: { toString: () => "otheruser" } } as any);
    await expect(tournamentService.deleteTournament("tour123", "user123")).rejects.toThrow(HttpError);
  });

  it("21. Should delete local banner file on tournament delete", async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockImplementation(() => {});
    mockRepo.findById.mockResolvedValue(mockTournament as any);
    mockRepo.delete.mockResolvedValue(mockTournament as any);
    await tournamentService.deleteTournament("tour123", "user123");
    expect(fs.unlinkSync).toHaveBeenCalled();
  });

  it("22. Should not delete file if bannerImage is a URL on delete", async () => {
    mockRepo.findById.mockResolvedValue({
      ...mockTournament,
      bannerImage: "https://example.com/banner.png",
    } as any);
    mockRepo.delete.mockResolvedValue(mockTournament as any);
    await tournamentService.deleteTournament("tour123", "user123");
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it("23. Should not delete file if bannerImage is undefined on delete", async () => {
    mockRepo.findById.mockResolvedValue({ ...mockTournament, bannerImage: undefined } as any);
    mockRepo.delete.mockResolvedValue(mockTournament as any);
    await tournamentService.deleteTournament("tour123", "user123");
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });
});