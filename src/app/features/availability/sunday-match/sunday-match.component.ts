import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';
import { MatchService } from '../../../core/services/match.service';
import { AvailabilityStatus } from '../../../core/models/availability.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PlayerAvatarComponent } from '../../../shared/components/player-avatar/player-avatar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-sunday-match',
  standalone: true,
  imports: [PageHeaderComponent, PlayerAvatarComponent, StatusBadgeComponent],
  templateUrl: './sunday-match.component.html',
})
export class SundayMatchComponent {
  private readonly auth = inject(AuthService);
  private readonly players = inject(PlayerService);
  private readonly match = inject(MatchService);

  readonly week = computed(() => this.match.ensureCurrentWeek());
  readonly isAdmin = this.auth.isAdmin;
  readonly myPlayerId = this.auth.currentPlayerId;

  readonly statuses: AvailabilityStatus[] = ['available', 'unavailable', 'pending'];

  playersForStatus(status: AvailabilityStatus) {
    const week = this.week();
    const ids = week.availability.filter((a) => a.status === status).map((a) => a.playerId);
    return this.players.players().filter((p) => ids.includes(p.id));
  }

  readonly confirmedTotal = computed(
    () => this.week().availability.filter((a) => a.status === 'available').length,
  );

  readonly pendingTotal = computed(
    () => this.week().availability.filter((a) => a.status === 'pending').length,
  );

  canEdit(playerId: string): boolean {
    return this.isAdmin() || this.myPlayerId() === playerId;
  }

  setStatus(playerId: string, status: AvailabilityStatus): void {
    if (!this.canEdit(playerId)) return;
    const session = this.auth.session();
    if (!session) return;
    this.match.setAvailability(this.week().id, playerId, status, session.userId);
  }
}