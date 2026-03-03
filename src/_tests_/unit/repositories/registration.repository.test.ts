import mongoose from "mongoose";
import { registrationRepository } from "../../../repositories/registration.repository";
import { RegistrationModel } from "../../../models/registration.model";
import { TournamentModel } from "../../../models/tournament.model";
import { UserModel } from "../../../models/user.model";

const createTestUser = async (email?: string) => {
  const user = new UserModel({
    fullName: "Test User",
    email: email || `user_${Date.now()}@test.com`,
    password: "hashedpassword123",
    role: "user",
  });
  return await user.save();
};

const createTestTournament = async (userId: string) => {
  const tournament = new TournamentModel({
    title: "Test Tournament",
    description: "Test description",
    type: "football",
    location: "Kathmandu",
    startDate: new Date("2025-08-01"),
    endDate: new Date("2025-08-15"),
    maxTeams: 16,
    createdBy: userId,
  });
  return await tournament.save();
};

const makeRegistrationData = (tournamentId: string, registeredBy: string) => ({
  tournamentId,
  registeredBy,
  tournamentTitle: "Test Tournament",
  teamName: "GoalNepal FC",
  captainName: "Ram Bahadur",
  captainPhone: "9800000000",
  captainEmail: "captain@test.com",
  playerCount: 11,
  players: [{ name: "Player One", position: "Forward", jerseyNumber: 9 }],
});

describe("Registration Repository Integration Tests", () => {
  let userId: string;
  let tournamentId: string;

  beforeEach(async () => {
    await RegistrationModel.deleteMany({});
    await TournamentModel.deleteMany({});
    await UserModel.deleteMany({});
    const user = await createTestUser();
    userId = user._id.toString();
    const tournament = await createTestTournament(userId);
    tournamentId = tournament._id.toString();
  });

  afterAll(async () => {
    await RegistrationModel.deleteMany({});
    await TournamentModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  it("1. Should create a new registration", async () => {
    const registration = await registrationRepository.create(makeRegistrationData(tournamentId, userId));
    expect(registration._id).toBeDefined();
    expect(registration.tournamentId.toString()).toBe(tournamentId);
    expect(registration.registeredBy.toString()).toBe(userId);
  });

  it("2. Should set default status to pending", async () => {
    const registration = await registrationRepository.create(makeRegistrationData(tournamentId, userId));
    expect(registration.status).toBe("pending");
  });

  it("3. Should store players array correctly", async () => {
    const registration = await registrationRepository.create(makeRegistrationData(tournamentId, userId));
    expect(registration.players.length).toBe(1);
    expect(registration.players[0].name).toBe("Player One");
  });

  it("4. Should allow different users to register for same tournament", async () => {
    const user2 = await createTestUser(`user2_${Date.now()}@test.com`);
    await registrationRepository.create(makeRegistrationData(tournamentId, userId));
    await registrationRepository.create(makeRegistrationData(tournamentId, user2._id.toString()));
    const results = await registrationRepository.findByTournament(tournamentId);
    expect(results.length).toBe(2);
  });

  it("5. Should find existing registration by tournament and user", async () => {
    await registrationRepository.create(makeRegistrationData(tournamentId, userId));
    const found = await registrationRepository.findByTournamentAndUser(tournamentId, userId);
    expect(found).not.toBeNull();
    expect(found!.registeredBy.toString()).toBe(userId);
  });

  it("6. Should return null if registration does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const found = await registrationRepository.findByTournamentAndUser(fakeId, userId);
    expect(found).toBeNull();
  });

  it("7. Should return null for wrong user-tournament combination", async () => {
    await registrationRepository.create(makeRegistrationData(tournamentId, userId));
    const user2 = await createTestUser(`user3_${Date.now()}@test.com`);
    const found = await registrationRepository.findByTournamentAndUser(tournamentId, user2._id.toString());
    expect(found).toBeNull();
  });

  it("8. Should find all registrations by user", async () => {
    const tournament2 = await createTestTournament(userId);
    await registrationRepository.create(makeRegistrationData(tournamentId, userId));
    await registrationRepository.create(makeRegistrationData(tournament2._id.toString(), userId));
    const results = await registrationRepository.findByUser(userId);
    expect(results.length).toBe(2);
  });

  it("9. Should return empty array if user has no registrations", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const results = await registrationRepository.findByUser(fakeId);
    expect(results.length).toBe(0);
  });

  it("10. Should populate tournament details in findByUser", async () => {
    await registrationRepository.create(makeRegistrationData(tournamentId, userId));
    const results = await registrationRepository.findByUser(userId);
    const populated = results[0].tournamentId as any;
    expect(populated.title).toBeDefined();
    expect(populated.location).toBeDefined();
  });

  it("11. Should find all registrations for a tournament", async () => {
    const user2 = await createTestUser(`user4_${Date.now()}@test.com`);
    await registrationRepository.create(makeRegistrationData(tournamentId, userId));
    await registrationRepository.create(makeRegistrationData(tournamentId, user2._id.toString()));
    const results = await registrationRepository.findByTournament(tournamentId);
    expect(results.length).toBe(2);
  });

  it("12. Should return empty array if no registrations for tournament", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const results = await registrationRepository.findByTournament(fakeId);
    expect(results.length).toBe(0);
  });

  it("13. Should populate user details in findByTournament", async () => {
    await registrationRepository.create(makeRegistrationData(tournamentId, userId));
    const results = await registrationRepository.findByTournament(tournamentId);
    const populated = results[0].registeredBy as any;
    expect(populated.fullName).toBeDefined();
    expect(populated.email).toBeDefined();
  });

  it("14. Create + findByTournamentAndUser + findByUser workflow", async () => {
    await registrationRepository.create(makeRegistrationData(tournamentId, userId));
    const exists = await registrationRepository.findByTournamentAndUser(tournamentId, userId);
    expect(exists).not.toBeNull();
    const myRegistrations = await registrationRepository.findByUser(userId);
    expect(myRegistrations.length).toBe(1);
  });

  it("15. Multiple users register, findByTournament returns all", async () => {
    const users = await Promise.all([
      createTestUser(`a_${Date.now()}@test.com`),
      createTestUser(`b_${Date.now() + 1}@test.com`),
      createTestUser(`c_${Date.now() + 2}@test.com`),
    ]);
    for (const u of users) {
      await registrationRepository.create(makeRegistrationData(tournamentId, u._id.toString()));
    }
    const results = await registrationRepository.findByTournament(tournamentId);
    expect(results.length).toBe(3);
  });
});