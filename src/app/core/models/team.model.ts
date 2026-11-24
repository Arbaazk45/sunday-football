import { Position } from './player.model';

export interface TeamSide {
  playerIds: string[];
  totalSkill: number;
  avgSkill: number;
  positionCounts: Record<Position, number>;
  substitutePlayerId?: string;
}

export interface GeneratedTeams {
  teamA: TeamSide;
  teamB: TeamSide;
  balanceScore: number;
  generatedAt: string;
  algorithmVersion: string;
  substitutePlayerId?: string;
}

export interface TeamGenerationResult {
  success: true;
  teams: GeneratedTeams;
  message?: string;
}

export interface TeamGenerationError {
  success: false;
  message: string;
  minimumRequired?: number;
}

export type TeamGenerationOutcome = TeamGenerationResult | TeamGenerationError;