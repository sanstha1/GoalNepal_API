import { registrationRepository } from "../repositories/registration.repository";
import { CreateRegistrationDto } from "../dtos/registration.dto";
import { IRegistration } from "../models/registration.model";

class RegistrationService {
  async registerForTournament(
    dto: CreateRegistrationDto,
    userId: string
  ): Promise<IRegistration> {
    const existing = await registrationRepository.findByTournamentAndUser(
      dto.tournamentId,
      userId
    );

    if (existing) {
      throw new Error("You have already registered for this tournament");
    }

    return await registrationRepository.create({
      ...dto,
      registeredBy: userId,
    });
  }

  async getMyRegistrations(userId: string): Promise<IRegistration[]> {
    return await registrationRepository.findByUser(userId);
  }

  async getTournamentRegistrations(
    tournamentId: string
  ): Promise<IRegistration[]> {
    return await registrationRepository.findByTournament(tournamentId);
  }
}

export const registrationService = new RegistrationService();