import { GeneratedTeams } from './team.model';
import { AvailabilityEntry } from './availability.model';

export interface MatchWeek {
  id: string;
  date: string;
  time?: string;
  venue?: string;
  availability: AvailabilityEntry[];
  teams?: GeneratedTeams;
  finalizedAt?: string;
}

export interface AppSettings {
  defaultMatchTime?: string;
  defaultVenue?: string;
  availabilityPath: string;
}