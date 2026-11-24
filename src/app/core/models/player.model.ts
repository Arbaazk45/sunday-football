export type Position = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

export const POSITIONS: Position[] = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

export interface Player {
  id: string;
  fullName: string;
  email: string;
  age: number;
  avatarUrl?: string;
  position: Position;
  yearsExperience: number;
  achievements: string;
  strengths: string;
  skillRating: number;
  achievementBoost?: number;
}

export interface PlayerFormValue {
  fullName: string;
  email: string;
  age: number;
  avatarUrl?: string;
  position: Position;
  yearsExperience: number;
  achievements: string;
  strengths: string;
  skillRating: number;
  achievementBoost?: number;
}