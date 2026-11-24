import { Component, inject, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PlayerAvatarComponent } from '../../../shared/components/player-avatar/player-avatar.component';
import { AdminBadgeComponent } from '../../../shared/components/admin-badge/admin-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    PlayerAvatarComponent,
    AdminBadgeComponent,
    EmptyStateComponent,
  ],
  templateUrl: './player-detail.component.html',
})
export class PlayerDetailComponent {
  readonly id = input.required<string>();

  private readonly players = inject(PlayerService);
  private readonly auth = inject(AuthService);

  readonly player = computed(() => this.players.getPlayerById(this.id()));
  readonly isAdmin = this.auth.isAdmin;

  isPlayerAdmin(playerId: string): boolean {
    return this.auth.isAdminPlayer(playerId);
  }
}