import { inject } from '@angular/core';
import { SeedService } from '../services/seed.service';
import { MatchService } from '../services/match.service';

export function appInitializer(): void {
  const seed = inject(SeedService);
  const match = inject(MatchService);
  seed.initializeIfNeeded();
  match.ensureCurrentWeek();
}