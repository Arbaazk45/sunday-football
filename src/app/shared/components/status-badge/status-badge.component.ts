import { Component, computed, input } from '@angular/core';
import { AvailabilityStatus, AVAILABILITY_LABELS } from '../../../core/models/availability.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="badge-status" [class]="className()">{{ label() }}</span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<AvailabilityStatus>();

  readonly label = computed(() => AVAILABILITY_LABELS[this.status()]);
  readonly className = computed(() => `badge-status badge-status--${this.status()}`);
}