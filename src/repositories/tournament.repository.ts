import mongoose from "mongoose";
import { TournamentModel, ITournament } from "../models/tournament.model";
import { CreateTournamentDto, UpdateTournamentDto } from "../dtos/tournament.dto";
import { TournamentQuery, PaginatedTournaments } from "../types/tournament.type";

class TournamentRepository {
  async create(
    data: CreateTournamentDto & { bannerImage?: string; createdBy: string }
  ): Promise<ITournament> {
    const tournament = new TournamentModel({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
    return await tournament.save();
  }

  async findById(id: string): Promise<ITournament | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await TournamentModel.findById(id).populate(
      "createdBy",
      "fullName email profilePicture"
    );
  }

  async findAll(
    query: TournamentQuery
  ): Promise<PaginatedTournaments<ITournament>> {
    const { type, location, page = 1, limit = 10 } = query;
    const filter: Record<string, unknown> = {};

    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: "i" };

    const skip = (page - 1) * limit;
    const total = await TournamentModel.countDocuments(filter);
    const data = await TournamentModel.find(filter)
      .populate("createdBy", "fullName email profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCreatedBy(createdBy: string): Promise<ITournament[]> {
    return await TournamentModel.find({ createdBy })
      .populate("createdBy", "fullName email profilePicture")
      .sort({ createdAt: -1 });
  }

  async update(
    id: string,
    data: UpdateTournamentDto & { bannerImage?: string }
  ): Promise<ITournament | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const updateData: Record<string, unknown> = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    return await TournamentModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "fullName email profilePicture");
  }

  async delete(id: string): Promise<ITournament | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await TournamentModel.findByIdAndDelete(id);
  }
}

export const tournamentRepository = new TournamentRepository();