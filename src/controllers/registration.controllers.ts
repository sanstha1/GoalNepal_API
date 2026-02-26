import { Request, Response, NextFunction } from "express";
import { registrationService } from "../services/registration.services";
import { CreateRegistrationDto } from "../dtos/registration.dto";

class RegistrationController {
  async registerForTournament(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = req.body as CreateRegistrationDto;
      const userId = req.user!.id;

      const registration = await registrationService.registerForTournament(
        dto,
        userId
      );

      res.status(201).json({
        success: true,
        message: "Registered successfully",
        data: registration,
      });
    } catch (error: any) {
      if (error.message === "You have already registered for this tournament") {
        res.status(409).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  async getMyRegistrations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const registrations = await registrationService.getMyRegistrations(
        req.user!.id
      );
      res.status(200).json({ success: true, data: registrations });
    } catch (error) {
      next(error);
    }
  }

  async getTournamentRegistrations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const registrations =
        await registrationService.getTournamentRegistrations(
          req.params.tournamentId
        );
      res.status(200).json({ success: true, data: registrations });
    } catch (error) {
      next(error);
    }
  }
}

export const registrationController = new RegistrationController();