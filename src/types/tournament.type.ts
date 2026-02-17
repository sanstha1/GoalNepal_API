export type TournamentSportType = "football" | "futsal";

export interface TournamentQuery {
  type?: TournamentSportType;
  location?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTournaments<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}