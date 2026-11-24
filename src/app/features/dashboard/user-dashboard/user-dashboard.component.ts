import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';
import { MatchService } from '../../../core/services/match.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AVAILABILITY_LABELS, AvailabilityStatus } from '../../../core/models/availability.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './user-dashboard.component.html',
})
export class UserDashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly players = inject(PlayerService);
  private readonly match = inject(MatchService);

  readonly session = this.auth.session;
  readonly week = computed(() => this.match.ensureCurrentWeek());

  readonly myStatus = computed((): AvailabilityStatus => {
    const pid = this.auth.currentPlayerId();
    if (!pid) return 'pending';
    const entry = this.week().availability.find((a) => a.playerId === pid);
    return entry?.status ?? 'pending';
  });

  readonly confirmedCount = computed(
    () => this.week().availability.filter((a) => a.status === 'available').length,
  );

  readonly totalPlayers = computed(() => this.players.players().length);
  readonly teams = computed(() => this.week().teams);

  statusLabel(status: AvailabilityStatus): string {
    return AVAILABILITY_LABELS[status];
  }
}