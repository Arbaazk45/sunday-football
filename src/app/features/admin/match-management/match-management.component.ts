import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatchService } from '../../../core/services/match.service';
import { SettingsService } from '../../../core/services/settings.service';
import {
  buildMatchWhatsAppMessage,
  whatsAppShareUrl,
} from '../../../core/utils/whatsapp-message.util';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-match-management',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './match-management.component.html',
})
export class MatchManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly match = inject(MatchService);
  private readonly settings = inject(SettingsService);

  readonly saved = signal(false);

  readonly form = this.fb.nonNullable.group({
    time: ['08:00'],
    venue: [''],
    defaultTime: ['08:00'],
    defaultVenue: [''],
  });

  ngOnInit(): void {
    const week = this.match.getCurrentWeek();
    const s = this.settings.settings();
    this.form.patchValue({
      time: week.time ?? s.defaultMatchTime ?? '',
      venue: week.venue ?? s.defaultVenue ?? '',
      defaultTime: s.defaultMatchTime ?? '',
      defaultVenue: s.defaultVenue ?? '',
    });
  }

  save(): void {
    const v = this.form.getRawValue();
    const week = this.match.getCurrentWeek();
    this.match.updateWeekDetails(week.id, v.time, v.venue);
    this.settings.update({
      defaultMatchTime: v.defaultTime,
      defaultVenue: v.defaultVenue,
    });
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }

  shareWhatsApp(): void {
    const week = this.match.getCurrentWeek();
    const counts = this.match.countByStatus(week);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const msg = buildMatchWhatsAppMessage({
      dateLabel: week.date,
      time: week.time,
      venue: week.venue,
      confirmedCount: counts.available,
      availabilityHint: `${origin}${this.settings.settings().availabilityPath}`,
    });
    window.open(whatsAppShareUrl(msg), '_blank', 'noopener');
  }
}