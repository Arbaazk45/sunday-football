import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { StorageKeys } from '../models/app-state.keys';
import { Player } from '../models/player.model';
import { User } from '../models/user.model';
import { AppSettings } from '../models/match.model';
import seedPlayers from '../data/seed-players.json';

@Injectable({ providedIn: 'root' })
export class SeedService {
  private readonly storage = inject(StorageService);

  initializeIfNeeded(): void {
    if (this.storage.get<boolean>(StorageKeys.seeded)) {
      return;
    }

    const players = seedPlayers as Player[];
    this.storage.set(StorageKeys.players, players);

    const adminUser: User = {
      id: 'user-admin',
      email: 'admin@sunday.local',
      password: 'Admin123!',
      role: 'admin',
      playerId: 'seed-admin-player',
      createdAt: new Date().toISOString(),
    };

    this.storage.set(StorageKeys.users, [adminUser]);

    const settings: AppSettings = {
      defaultMatchTime: '08:00',
      defaultVenue: 'Central Park Ground',
      availabilityPath: '/sunday-match',
    };
    this.storage.set(StorageKeys.settings, settings);
    this.storage.set(StorageKeys.matchWeeks, []);
    this.storage.set(StorageKeys.seeded, true);
  }
}