import { registrationService } from "../../../services/registration.services";
import { registrationRepository } from "../../../repositories/registration.repository";

jest.mock("../../../repositories/registration.repository");

const mockRegistrationRepository = registrationRepository as jest.Mocked<typeof registrationRepository>;

describe("RegistrationService Unit Tests", () => {
  const fakeRegistration = {
    _id: "reg123",
    tournamentId: "tour123",
    registeredBy: "user123",
    teamName: "GoalNepal FC",
    status: "pending",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("1. Should register for tournament successfully", async () => {
    mockRegistrationRepository.findByTournamentAndUser = jest.fn().mockResolvedValue(null);
    mockRegistrationRepository.create = jest.fn().mockResolvedValue(fakeRegistration);
    const result = await registrationService.registerForTournament({ tournamentId: "tour123", teamName: "GoalNepal FC" } as any, "user123");
    expect(result).toEqual(fakeRegistration);
    expect(mockRegistrationRepository.create).toHaveBeenCalled();
  });

  it("2. Should throw if already registered", async () => {
    mockRegistrationRepository.findByTournamentAndUser = jest.fn().mockResolvedValue(fakeRegistration);
    await expect(
      registrationService.registerForTournament({ tournamentId: "tour123" } as any, "user123")
    ).rejects.toThrow("You have already registered for this tournament");
  });

  it("3. Should get my registrations", async () => {
    mockRegistrationRepository.findByUser = jest.fn().mockResolvedValue([fakeRegistration]);
    const result = await registrationService.getMyRegistrations("user123");
    expect(result).toEqual([fakeRegistration]);
  });

  it("4. Should get tournament registrations", async () => {
    mockRegistrationRepository.findByTournament = jest.fn().mockResolvedValue([fakeRegistration]);
    const result = await registrationService.getTournamentRegistrations("tour123");
    expect(result).toEqual([fakeRegistration]);
  });
});