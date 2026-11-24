import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';
import { MatchService } from '../../../core/services/match.service';
import { SettingsService } from '../../../core/services/settings.service';
import { TeamGeneratorService } from '../../../core/services/team-generator.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import {
  buildMatchWhatsAppMessage,
  whatsAppShareUrl,
} from '../../../core/utils/whatsapp-message.util';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly players = inject(PlayerService);
  private readonly match = inject(MatchService);
  private readonly settings = inject(SettingsService);
  private readonly teamGen = inject(TeamGeneratorService);

  readonly copyHint = signal<string | null>(null);

  readonly week = computed(() => this.match.ensureCurrentWeek());
  readonly counts = computed(() => this.match.countByStatus(this.week()));

  readonly totalPlayers = computed(() => this.players.players().length);

  generateTeams(): void {
    this.teamGen.generate();
  }

  shareWhatsApp(): void {
    const week = this.week();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path = this.settings.settings().availabilityPath;
    const msg = buildMatchWhatsAppMessage({
      dateLabel: week.date,
      time: week.time,
      venue: week.venue,
      confirmedCount: this.counts().available,
      availabilityHint: `${origin}${path}`,
    });
    window.open(whatsAppShareUrl(msg), '_blank', 'noopener');
  }

  async copyMessage(): Promise<void> {
    const week = this.week();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path = this.settings.settings().availabilityPath;
    const msg = buildMatchWhatsAppMessage({
      dateLabel: week.date,
      time: week.time,
      venue: week.venue,
      confirmedCount: this.counts().available,
      availabilityHint: `${origin}${path}`,
    });
    try {
      await navigator.clipboard.writeText(msg);
      this.copyHint.set('Message copied to clipboard.');
      setTimeout(() => this.copyHint.set(null), 2500);
    } catch {
      this.copyHint.set('Could not copy — select text manually.');
    }
  }
}