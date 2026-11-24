import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { StorageKeys } from '../models/app-state.keys';
import { AppSettings } from '../models/match.model';

const DEFAULT_SETTINGS: AppSettings = {
  defaultMatchTime: '08:00',
  defaultVenue: 'Central Park Ground',
  availabilityPath: '/sunday-match',
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly storage = inject(StorageService);
  private readonly settingsSignal = signal<AppSettings>(this.load());

  readonly settings = this.settingsSignal.asReadonly();

  private load(): AppSettings {
    return this.storage.get<AppSettings>(StorageKeys.settings) ?? DEFAULT_SETTINGS;
  }

  update(partial: Partial<AppSettings>): void {
    const next = { ...this.settings(), ...partial };
    this.storage.set(StorageKeys.settings, next);
    this.settingsSignal.set(next);
  }
}