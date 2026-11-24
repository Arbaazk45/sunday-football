import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { StorageKeys } from '../models/app-state.keys';
import { Player, PlayerFormValue } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly storage = inject(StorageService);
  private readonly playersSignal = signal<Player[]>(this.load());

  readonly players = this.playersSignal.asReadonly();

  private load(): Player[] {
    return this.storage.get<Player[]>(StorageKeys.players) ?? [];
  }

  private persist(players: Player[]): void {
    this.storage.set(StorageKeys.players, players);
    this.playersSignal.set(players);
  }

  reload(): void {
    this.playersSignal.set(this.load());
  }

  getPlayerById(id: string): Player | undefined {
    return this.players().find((p) => p.id === id);
  }

  upsertPlayer(player: Player): void {
    const list = this.load();
    const idx = list.findIndex((p) => p.id === player.id);
    if (idx >= 0) list[idx] = player;
    else list.push(player);
    this.persist(list);
  }

  addPlayer(value: PlayerFormValue): Player {
    const player: Player = {
      id: crypto.randomUUID(),
      ...value,
      achievementBoost: value.achievementBoost ?? 0,
    };
    this.persist([...this.load(), player]);
    return player;
  }

  updatePlayer(id: string, value: Partial<PlayerFormValue>): Player | null {
    const list = this.load();
    const idx = list.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    const updated = { ...list[idx], ...value };
    list[idx] = updated;
    this.persist(list);
    return updated;
  }

  deletePlayer(id: string): boolean {
    const list = this.load().filter((p) => p.id !== id);
    if (list.length === this.load().length) return false;
    this.persist(list);
    return true;
  }
}