import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { StorageKeys } from '../models/app-state.keys';
import { MatchWeek } from '../models/match.model';
import { AvailabilityEntry, AvailabilityStatus } from '../models/availability.model';
import { GeneratedTeams } from '../models/team.model';
import { formatDateDisplay, getUpcomingSunday, toSundayId } from '../utils/sunday-date.util';
import { SettingsService } from './settings.service';
import { PlayerService } from './player.service';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private readonly storage = inject(StorageService);
  private readonly settings = inject(SettingsService);
  private readonly playerService = inject(PlayerService);

  private readonly weeksSignal = signal<MatchWeek[]>(this.load());

  readonly matchWeeks = this.weeksSignal.asReadonly();

  readonly upcomingSunday = computed(() => getUpcomingSunday());
  readonly upcomingSundayId = computed(() => toSundayId(this.upcomingSunday()));
  readonly upcomingDateLabel = computed(() => formatDateDisplay(this.upcomingSunday()));

  private load(): MatchWeek[] {
    return this.storage.get<MatchWeek[]>(StorageKeys.matchWeeks) ?? [];
  }

  private persist(weeks: MatchWeek[]): void {
    this.storage.set(StorageKeys.matchWeeks, weeks);
    this.weeksSignal.set(weeks);
  }

  ensureCurrentWeek(): MatchWeek {
    const id = this.upcomingSundayId();
    const weeks = this.load();
    let week = weeks.find((w) => w.id === id);
    if (!week) {
      const s = this.settings.settings();
      week = {
        id,
        date: this.upcomingDateLabel(),
        time: s.defaultMatchTime,
        venue: s.defaultVenue,
        availability: this.initAvailability(),
      };
      this.persist([...weeks, week]);
      return week;
    }
    const synced = this.syncPlayerAvailability(week);
    if (synced !== week) {
      this.persist(weeks.map((w) => (w.id === synced.id ? synced : w)));
      return synced;
    }
    return week;
  }

  getCurrentWeek(): MatchWeek {
    return this.ensureCurrentWeek();
  }

  getWeekById(id: string): MatchWeek | undefined {
    return this.load().find((w) => w.id === id);
  }

  private initAvailability(): AvailabilityEntry[] {
    return this.playerService.players().map((p) => ({
      playerId: p.id,
      status: 'pending' as AvailabilityStatus,
      updatedAt: new Date().toISOString(),
      updatedByUserId: 'system',
    }));
  }

  private syncPlayerAvailability(week: MatchWeek): MatchWeek {
    const players = this.playerService.players();
    let changed = false;
    const av = [...week.availability];
    for (const p of players) {
      if (!av.some((a) => a.playerId === p.id)) {
        av.push({
          playerId: p.id,
          status: 'pending',
          updatedAt: new Date().toISOString(),
          updatedByUserId: 'system',
        });
        changed = true;
      }
    }
    if (!changed) return week;
    return { ...week, availability: av };
  }

  refreshWeekDateLabel(week: MatchWeek): void {
    const sunday = getUpcomingSunday();
    if (week.id === toSundayId(sunday)) {
      week.date = formatDateDisplay(sunday);
    }
  }

  updateWeekDetails(id: string, time?: string, venue?: string): void {
    const weeks = this.load();
    const idx = weeks.findIndex((w) => w.id === id);
    if (idx < 0) return;
    weeks[idx] = { ...weeks[idx], time, venue };
    this.persist(weeks);
  }

  setAvailability(
    weekId: string,
    playerId: string,
    status: AvailabilityStatus,
    userId: string
  ): void {
    const weeks = this.load();
    const idx = weeks.findIndex((w) => w.id === weekId);
    if (idx < 0) return;
    const week = { ...weeks[idx] };
    const av = [...week.availability];
    const ai = av.findIndex((a) => a.playerId === playerId);
    const entry: AvailabilityEntry = {
      playerId,
      status,
      updatedAt: new Date().toISOString(),
      updatedByUserId: userId,
    };
    if (ai >= 0) av[ai] = entry;
    else av.push(entry);
    week.availability = av;
    weeks[idx] = week;
    this.persist(weeks);
  }

  getAvailabilityMap(week: MatchWeek): Map<string, AvailabilityStatus> {
    return new Map(week.availability.map((a) => [a.playerId, a.status]));
  }

  saveTeams(weekId: string, teams: GeneratedTeams): void {
    const weeks = this.load();
    const idx = weeks.findIndex((w) => w.id === weekId);
    if (idx < 0) return;
    weeks[idx] = { ...weeks[idx], teams, finalizedAt: new Date().toISOString() };
    this.persist(weeks);
  }

  getPastWeeks(): MatchWeek[] {
    const currentId = this.upcomingSundayId();
    return this.load()
      .filter((w) => w.id !== currentId)
      .sort((a, b) => b.id.localeCompare(a.id));
  }

  countByStatus(week: MatchWeek): Record<AvailabilityStatus, number> {
    const counts: Record<AvailabilityStatus, number> = {
      available: 0,
      unavailable: 0,
      pending: 0,
    };
    for (const a of week.availability) {
      counts[a.status]++;
    }
    return counts;
  }
}