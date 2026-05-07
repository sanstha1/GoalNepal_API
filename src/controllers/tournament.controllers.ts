import { Request, Response, NextFunction } from "express";
import { tournamentService } from "../services/tournament.services";
import { CreateTournamentDto, UpdateTournamentDto } from "../dtos/tournament.dto";
import { TournamentQuery } from "../types/tournament.type";

class TournamentController {
  async createTournament(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CreateTournamentDto = {
        ...req.body,
        registrationFee: req.body.registrationFee !== undefined && req.body.registrationFee !== ""
          ? Number(req.body.registrationFee)
          : 0,
        maxTeams: req.body.maxTeams !== undefined && req.body.maxTeams !== ""
          ? Number(req.body.maxTeams)
          : undefined,
      };
      const userId = req.user!.id;
      const bannerFile = req.file;
      const bannerUrl = req.body.bannerImage as string | undefined;

      const tournament = await tournamentService.createTournament(dto, userId, bannerFile, bannerUrl);

      res.status(201).json({
        success: true,
        message: "Tournament created successfully",
        data: tournament,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTournamentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tournament = await tournamentService.getTournamentById(req.params.id);

      res.status(200).json({
        success: true,
        data: tournament,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTournaments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: TournamentQuery = {
        type: req.query.type as TournamentQuery["type"],
        location: req.query.location as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      const result = await tournamentService.getAllTournaments(query);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyTournaments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tournaments = await tournamentService.getMyTournaments(req.user!.id);

      res.status(200).json({
        success: true,
        data: tournaments,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTournament(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: UpdateTournamentDto = {
        ...req.body,
        ...(req.body.registrationFee !== undefined && req.body.registrationFee !== "" && {
          registrationFee: Number(req.body.registrationFee),
        }),
        ...(req.body.maxTeams !== undefined && req.body.maxTeams !== "" && {
          maxTeams: Number(req.body.maxTeams),
        }),
      };
      const bannerFile = req.file;
      const bannerUrl = req.body.bannerImage as string | undefined;

      const tournament = await tournamentService.updateTournament(
        req.params.id,
        dto,
        req.user!.id,
        bannerFile,
        bannerUrl
      );

      res.status(200).json({
        success: true,
        message: "Tournament updated successfully",
        data: tournament,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTournament(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await tournamentService.deleteTournament(req.params.id, req.user!.id);

      res.status(200).json({
        success: true,
        message: "Tournament deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const tournamentController = new TournamentController();