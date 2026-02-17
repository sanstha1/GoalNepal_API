export interface CreateTournamentDto {
  title: string;
  type: "football" | "futsal";
  location: string;
  startDate: string;
  endDate: string;
  organizer?: string;
  description?: string;
  prize?: string;
  maxTeams?: number;
}

export interface UpdateTournamentDto {
  title?: string;
  type?: "football" | "futsal";
  location?: string;
  startDate?: string;
  endDate?: string;
  organizer?: string;
  description?: string;
  prize?: string;
  maxTeams?: number;
}