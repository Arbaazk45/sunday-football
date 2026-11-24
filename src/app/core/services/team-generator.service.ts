import { Injectable, inject } from '@angular/core';
import {
  generateBalancedTeams,
  MIN_PLAYERS_ABSOLUTE,
} from '../algorithms/team-balancing.algorithm';
import { PlayerService } from './player.service';
import { MatchService } from './match.service';
import { TeamGenerationOutcome } from '../models/team.model';

@Injectable({ providedIn: 'root' })
export class TeamGeneratorService {
  private readonly players = inject(PlayerService);
  private readonly match = inject(MatchService);

  generate(seed?: number): TeamGenerationOutcome {
    const week = this.match.getCurrentWeek();
    const map = this.match.getAvailabilityMap(week);
    const outcome = generateBalancedTeams(this.players.players(), map, {
      seed: seed ?? Date.now(),
      minimum: MIN_PLAYERS_ABSOLUTE,
    });
    if (outcome.success) {
      this.match.saveTeams(week.id, outcome.teams);
    }
    return outcome;
  }
}