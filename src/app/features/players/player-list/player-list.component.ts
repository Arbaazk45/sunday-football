import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PlayerAvatarComponent } from '../../../shared/components/player-avatar/player-avatar.component';
import { AdminBadgeComponent } from '../../../shared/components/admin-badge/admin-badge.component';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, PlayerAvatarComponent, AdminBadgeComponent],
  templateUrl: './player-list.component.html',
})
export class PlayerListComponent {
  readonly auth = inject(AuthService);
  readonly playerService = inject(PlayerService);

  readonly players = this.playerService.players;
  readonly isAdmin = this.auth.isAdmin;

  isPlayerAdmin(playerId: string): boolean {
    return this.auth.isAdminPlayer(playerId);
  }
}