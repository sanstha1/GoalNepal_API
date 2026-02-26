import { RegistrationModel, IRegistration } from "../models/registration.model";
import { CreateRegistrationDto } from "../dtos/registration.dto";

class RegistrationRepository {
  async create(
    data: CreateRegistrationDto & { registeredBy: string }
  ): Promise<IRegistration> {
    const registration = new RegistrationModel(data);
    return await registration.save();
  }

  async findByTournamentAndUser(
    tournamentId: string,
    registeredBy: string
  ): Promise<IRegistration | null> {
    return await RegistrationModel.findOne({ tournamentId, registeredBy });
  }

  async findByUser(registeredBy: string): Promise<IRegistration[]> {
    return await RegistrationModel.find({ registeredBy })
      .populate("tournamentId", "title location startDate endDate bannerImage")
      .sort({ createdAt: -1 });
  }

  async findByTournament(tournamentId: string): Promise<IRegistration[]> {
    return await RegistrationModel.find({ tournamentId })
      .populate("registeredBy", "fullName email profilePicture")
      .sort({ createdAt: -1 });
  }
}

export const registrationRepository = new RegistrationRepository();