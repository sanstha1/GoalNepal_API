import mongoose from "mongoose";
import { tournamentRepository } from "../../../repositories/tournament.repository";
import { TournamentModel } from "../../../models/tournament.model";
import { UserModel } from "../../../models/user.model";

const createTestUser = async () => {
  const user = new UserModel({
    fullName: "Test User",
    email: `testuser_${Date.now()}@test.com`,
    password: "hashedpassword123",
    role: "user",
  });
  return await user.save();
};

const makeTournamentData = (createdBy: string) => ({
  title: "Kathmandu Cup 2025",
  description: "Annual football tournament",
  type: "football" as const,
  location: "Kathmandu",
  startDate: "2025-08-01",
  endDate: "2025-08-15",
  maxTeams: 16,
  createdBy,
});

describe("Tournament Repository Integration Tests", () => {
  let userId: string;

  beforeEach(async () => {
    await TournamentModel.deleteMany({});
    await UserModel.deleteMany({});
    const user = await createTestUser();
    userId = user._id.toString();
  });

  afterAll(async () => {
    await TournamentModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  it("1. Should create a new tournament", async () => {
    const tournament = await tournamentRepository.create(makeTournamentData(userId));
    expect(tournament._id).toBeDefined();
    expect(tournament.title).toBe("Kathmandu Cup 2025");
    expect(tournament.location).toBe("Kathmandu");
  });

  it("2. Should store startDate and endDate as Date objects", async () => {
    const tournament = await tournamentRepository.create(makeTournamentData(userId));
    expect(tournament.startDate).toBeInstanceOf(Date);
    expect(tournament.endDate).toBeInstanceOf(Date);
  });

  it("3. Should create tournament with optional bannerImage", async () => {
    const data = { ...makeTournamentData(userId), bannerImage: "tournament_banners/banner.png" };
    const tournament = await tournamentRepository.create(data);
    expect(tournament.bannerImage).toBe("tournament_banners/banner.png");
  });

  it("4. Should find tournament by valid ID", async () => {
    const created = await tournamentRepository.create(makeTournamentData(userId));
    const found = await tournamentRepository.findById(created._id.toString());
    expect(found).not.toBeNull();
    expect(found!.title).toBe("Kathmandu Cup 2025");
  });

  it("5. Should return null for invalid ObjectId", async () => {
    const result = await tournamentRepository.findById("invalid-id");
    expect(result).toBeNull();
  });

  it("6. Should return null for non-existing valid ObjectId", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const result = await tournamentRepository.findById(fakeId);
    expect(result).toBeNull();
  });

  it("7. Should return all tournaments with pagination", async () => {
    await tournamentRepository.create(makeTournamentData(userId));
    await tournamentRepository.create({ ...makeTournamentData(userId), title: "Pokhara Cup" });
    const result = await tournamentRepository.findAll({ page: 1, limit: 10 });
    expect(result.data.length).toBe(2);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
  });

  it("8. Should filter tournaments by type football", async () => {
    await tournamentRepository.create({ ...makeTournamentData(userId), title: "Football Cup", type: "football" as const });
    await tournamentRepository.create({ ...makeTournamentData(userId), title: "Futsal Cup", type: "futsal" as const });
    const result = await tournamentRepository.findAll({ type: "football" as const, page: 1, limit: 10 });
    expect(result.data.length).toBe(1);
    expect(result.data[0].type).toBe("football");
  });

  it("9. Should filter tournaments by type futsal", async () => {
    await tournamentRepository.create({ ...makeTournamentData(userId), title: "Football Cup", type: "football" as const });
    await tournamentRepository.create({ ...makeTournamentData(userId), title: "Futsal Cup", type: "futsal" as const });
    const result = await tournamentRepository.findAll({ type: "futsal" as const, page: 1, limit: 10 });
    expect(result.data.length).toBe(1);
    expect(result.data[0].type).toBe("futsal");
  });

  it("10. Should filter tournaments by location (case-insensitive)", async () => {
    await tournamentRepository.create({ ...makeTournamentData(userId), title: "Kathmandu Cup", location: "Kathmandu" });
    await tournamentRepository.create({ ...makeTournamentData(userId), title: "Pokhara Cup", location: "Pokhara" });
    const result = await tournamentRepository.findAll({ location: "kathmandu", page: 1, limit: 10 });
    expect(result.data.length).toBe(1);
    expect(result.data[0].location).toBe("Kathmandu");
  });

  it("11. Should paginate correctly", async () => {
    for (let i = 0; i < 5; i++) {
      await tournamentRepository.create({ ...makeTournamentData(userId), title: `Tournament ${i}` });
    }
    const page1 = await tournamentRepository.findAll({ page: 1, limit: 3 });
    const page2 = await tournamentRepository.findAll({ page: 2, limit: 3 });
    expect(page1.data.length).toBe(3);
    expect(page2.data.length).toBe(2);
    expect(page1.totalPages).toBe(2);
  });

  it("12. Should return empty array when page exceeds total", async () => {
    await tournamentRepository.create(makeTournamentData(userId));
    const result = await tournamentRepository.findAll({ page: 99, limit: 10 });
    expect(result.data.length).toBe(0);
  });

  it("13. Should find tournaments by createdBy userId", async () => {
    await tournamentRepository.create(makeTournamentData(userId));
    await tournamentRepository.create({ ...makeTournamentData(userId), title: "Cup 2" });
    const results = await tournamentRepository.findByCreatedBy(userId);
    expect(results.length).toBe(2);
  });

  it("14. Should return empty array if user has no tournaments", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const results = await tournamentRepository.findByCreatedBy(fakeId);
    expect(results.length).toBe(0);
  });

  it("15. Should update tournament title", async () => {
    const created = await tournamentRepository.create(makeTournamentData(userId));
    const updated = await tournamentRepository.update(created._id.toString(), { title: "Updated Cup" });
    expect(updated).not.toBeNull();
    expect(updated!.title).toBe("Updated Cup");
  });

  it("16. Should return null when updating with invalid ObjectId", async () => {
    const result = await tournamentRepository.update("invalid-id", { title: "Test" });
    expect(result).toBeNull();
  });

  it("17. Should update bannerImage", async () => {
    const created = await tournamentRepository.create(makeTournamentData(userId));
    const updated = await tournamentRepository.update(created._id.toString(), {
      bannerImage: "tournament_banners/new_banner.png",
    });
    expect(updated!.bannerImage).toBe("tournament_banners/new_banner.png");
  });

  it("18. Should update startDate and endDate as Date objects", async () => {
    const created = await tournamentRepository.create(makeTournamentData(userId));
    const updated = await tournamentRepository.update(created._id.toString(), {
      startDate: "2025-09-01",
      endDate: "2025-09-15",
    });
    expect(updated!.startDate).toBeInstanceOf(Date);
    expect(updated!.endDate).toBeInstanceOf(Date);
  });

  it("19. Should delete a tournament by ID", async () => {
    const created = await tournamentRepository.create(makeTournamentData(userId));
    const deleted = await tournamentRepository.delete(created._id.toString());
    expect(deleted).not.toBeNull();
    const found = await tournamentRepository.findById(created._id.toString());
    expect(found).toBeNull();
  });

  it("20. Should return null when deleting with invalid ObjectId", async () => {
    const result = await tournamentRepository.delete("invalid-id");
    expect(result).toBeNull();
  });

  it("21. Should return null when deleting non-existing tournament", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const result = await tournamentRepository.delete(fakeId);
    expect(result).toBeNull();
  });

  it("22. Create + update + find workflow", async () => {
    const created = await tournamentRepository.create(makeTournamentData(userId));
    await tournamentRepository.update(created._id.toString(), { location: "Lalitpur" });
    const found = await tournamentRepository.findById(created._id.toString());
    expect(found!.location).toBe("Lalitpur");
  });

  it("23. Create + delete + find returns null", async () => {
    const created = await tournamentRepository.create(makeTournamentData(userId));
    await tournamentRepository.delete(created._id.toString());
    const found = await tournamentRepository.findById(created._id.toString());
    expect(found).toBeNull();
  });

  it("24. Create multiple football + filter + paginate", async () => {
    for (let i = 0; i < 4; i++) {
      await tournamentRepository.create({ ...makeTournamentData(userId), title: `Football ${i}`, type: "football" as const });
    }
    await tournamentRepository.create({ ...makeTournamentData(userId), title: "Futsal One", type: "futsal" as const });
    const result = await tournamentRepository.findAll({ type: "football" as const, page: 1, limit: 2 });
    expect(result.data.length).toBe(2);
    expect(result.total).toBe(4);
    expect(result.totalPages).toBe(2);
  });
});