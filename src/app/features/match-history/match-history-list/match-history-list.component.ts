import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatchService } from '../../../core/services/match.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-match-history-list',
  standalone: true,
  imports: [DecimalPipe, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './match-history-list.component.html',
})
export class MatchHistoryListComponent {
  private readonly match = inject(MatchService);

  readonly past = computed(() => this.match.getPastWeeks());
  readonly current = computed(() => this.match.getCurrentWeek());
}