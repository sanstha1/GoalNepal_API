import fs from "fs";
import { tournamentRepository } from "../repositories/tournament.repository";
import { CreateTournamentDto, UpdateTournamentDto } from "../dtos/tournament.dto";
import { TournamentQuery, PaginatedTournaments } from "../types/tournament.type";
import { ITournament } from "../models/tournament.model";
import { HttpError } from "../errors/http-error";

class TournamentService {
  async createTournament(
    dto: CreateTournamentDto,
    createdBy: string,
    bannerFile?: Express.Multer.File,
    bannerUrl?: string
  ): Promise<ITournament> {
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new HttpError(400, "Start date must be before end date");
    }

    // file upload takes priority over URL string
    const bannerImage = bannerFile
      ? `tournament_banners/${bannerFile.filename}`
      : bannerUrl ?? undefined;

    return await tournamentRepository.create({ ...dto, bannerImage, createdBy });
  }

  async getTournamentById(id: string): Promise<ITournament> {
    const tournament = await tournamentRepository.findById(id);
    if (!tournament) throw new HttpError(404, "Tournament not found");
    return tournament;
  }

  async getAllTournaments(
    query: TournamentQuery
  ): Promise<PaginatedTournaments<ITournament>> {
    return await tournamentRepository.findAll(query);
  }

  async getMyTournaments(userId: string): Promise<ITournament[]> {
    return await tournamentRepository.findByCreatedBy(userId);
  }

  async updateTournament(
    id: string,
    dto: UpdateTournamentDto,
    userId: string,
    bannerFile?: Express.Multer.File,
    bannerUrl?: string
  ): Promise<ITournament> {
    const existing = await tournamentRepository.findById(id);
    if (!existing) throw new HttpError(404, "Tournament not found");

    if (existing.createdBy.toString() !== userId) {
      throw new HttpError(403, "You are not authorized to update this tournament");
    }

    if (dto.startDate && dto.endDate) {
      if (new Date(dto.startDate) >= new Date(dto.endDate)) {
        throw new HttpError(400, "Start date must be before end date");
      }
    }

    let bannerImage: string | undefined;

    if (bannerFile) {
      // New file uploaded — delete old file from disk if exists
      if (existing.bannerImage && !existing.bannerImage.startsWith("http")) {
        const oldPath = `${process.cwd()}/public/${existing.bannerImage}`;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      bannerImage = `tournament_banners/${bannerFile.filename}`;
    } else if (bannerUrl) {
      // Raw JSON URL string provided
      bannerImage = bannerUrl;
    }

    const updated = await tournamentRepository.update(id, {
      ...dto,
      ...(bannerImage && { bannerImage }),
    });

    if (!updated) throw new HttpError(500, "Tournament update failed");
    return updated;
  }

  async deleteTournament(id: string, userId: string): Promise<void> {
    const existing = await tournamentRepository.findById(id);
    if (!existing) throw new HttpError(404, "Tournament not found");

    if (existing.createdBy.toString() !== userId) {
      throw new HttpError(403, "You are not authorized to delete this tournament");
    }

    // Only delete from disk if it's a local file (not a URL)
    if (existing.bannerImage && !existing.bannerImage.startsWith("http")) {
      const filePath = `${process.cwd()}/public/${existing.bannerImage}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await tournamentRepository.delete(id);
  }
}

export const tournamentService = new TournamentService();