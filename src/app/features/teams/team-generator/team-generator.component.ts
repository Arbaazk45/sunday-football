import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';
import { MatchService } from '../../../core/services/match.service';
import { TeamGeneratorService } from '../../../core/services/team-generator.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PlayerAvatarComponent } from '../../../shared/components/player-avatar/player-avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Position } from '../../../core/models/player.model';
import { TeamSide } from '../../../core/models/team.model';

@Component({
  selector: 'app-team-generator',
  standalone: true,
  imports: [DecimalPipe, PageHeaderComponent, PlayerAvatarComponent, EmptyStateComponent],
  templateUrl: './team-generator.component.html',
})
export class TeamGeneratorComponent {
  private readonly auth = inject(AuthService);
  private readonly players = inject(PlayerService);
  private readonly match = inject(MatchService);
  private readonly teamGen = inject(TeamGeneratorService);

  readonly isAdmin = this.auth.isAdmin;
  readonly error = signal<string | null>(null);
  readonly info = signal<string | null>(null);

  readonly week = computed(() => this.match.ensureCurrentWeek());
  readonly teams = computed(() => this.week().teams);

  readonly confirmedCount = computed(
    () => this.week().availability.filter((a) => a.status === 'available').length,
  );

  generate(): void {
    this.error.set(null);
    this.info.set(null);
    const outcome = this.teamGen.generate(Date.now());
    if (!outcome.success) {
      this.error.set(outcome.message);
      return;
    }
    if (outcome.message) this.info.set(outcome.message);
  }

  regenerate(): void {
    this.generate();
  }

  playersInTeam(side: TeamSide) {
    return side.playerIds
      .map((id) => this.players.getPlayerById(id))
      .filter((p): p is NonNullable<typeof p> => !!p);
  }

  substituteName(): string | null {
    const subId = this.teams()?.substitutePlayerId ?? this.teams()?.teamA.substitutePlayerId;
    if (!subId) return null;
    return this.players.getPlayerById(subId)?.fullName ?? null;
  }

  positionRows(counts: Record<Position, number>): { pos: Position; n: number }[] {
    return (['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as Position[]).map((pos) => ({
      pos,
      n: counts[pos],
    }));
  }
}