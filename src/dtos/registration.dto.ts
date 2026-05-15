export interface PlayerDto {
  name: string;
  position?: string;
  jerseyNumber?: number;
}

export interface CreateRegistrationDto {
  tournamentId: string;
  tournamentTitle: string;
  teamName: string;
  captainName: string;
  captainPhone: string;
  captainEmail: string;
  playerCount: number;
  players?: PlayerDto[];
  feePaid: number;                                 
}