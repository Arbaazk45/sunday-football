import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { StorageKeys } from '../models/app-state.keys';
import { Session, User, UserRole } from '../models/user.model';
import { Player, PlayerFormValue, Position } from '../models/player.model';
import { PlayerService } from './player.service';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  age: number;
  avatarUrl?: string;
  position: Position;
  yearsExperience: number;
  achievements: string;
  strengths: string;
  skillRating: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly playerService = inject(PlayerService);
  private readonly router = inject(Router);

  private readonly sessionSignal = signal<Session | null>(this.loadSession());

  readonly session = this.sessionSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly isAdmin = computed(() => this.session()?.role === 'admin');
  readonly currentPlayerId = computed(() => this.session()?.playerId ?? null);

  private loadSession(): Session | null {
    return this.storage.get<Session>(StorageKeys.session);
  }

  login(email: string, password: string): { ok: true } | { ok: false; error: string } {
    const users = this.storage.get<User[]>(StorageKeys.users) ?? [];
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      return { ok: false, error: 'Invalid email or password.' };
    }
    const player = this.playerService.getPlayerById(user.playerId);
    if (!player) {
      return { ok: false, error: 'Player profile not found.' };
    }
    const session: Session = {
      userId: user.id,
      role: user.role,
      playerId: user.playerId,
      email: user.email,
      fullName: player.fullName,
    };
    this.storage.set(StorageKeys.session, session);
    this.sessionSignal.set(session);
    return { ok: true };
  }

  register(payload: RegisterPayload): { ok: true } | { ok: false; error: string } {
    const users = this.storage.get<User[]>(StorageKeys.users) ?? [];
    if (users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists.' };
    }

    const playerId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    const player: Player = {
      id: playerId,
      fullName: payload.fullName,
      email: payload.email,
      age: payload.age,
      avatarUrl: payload.avatarUrl,
      position: payload.position,
      yearsExperience: payload.yearsExperience,
      achievements: payload.achievements,
      strengths: payload.strengths,
      skillRating: payload.skillRating,
      achievementBoost: 0,
    };

    this.playerService.upsertPlayer(player);

    const user: User = {
      id: userId,
      email: payload.email,
      password: payload.password,
      role: 'user',
      playerId,
      createdAt: new Date().toISOString(),
    };

    this.storage.set(StorageKeys.users, [...users, user]);
    return this.login(payload.email, payload.password);
  }

  logout(): void {
    this.storage.remove(StorageKeys.session);
    this.sessionSignal.set(null);
    void this.router.navigate(['/auth/login']);
  }

  updateUserRole(userId: string, role: UserRole): void {
    const users = this.storage.get<User[]>(StorageKeys.users) ?? [];
    const next = users.map((u) => (u.id === userId ? { ...u, role } : u));
    this.storage.set(StorageKeys.users, next);
    const session = this.session();
    if (session?.userId === userId) {
      const updated = { ...session, role };
      this.storage.set(StorageKeys.session, updated);
      this.sessionSignal.set(updated);
    }
  }

  refreshSessionName(): void {
    const session = this.session();
    if (!session) return;
    const player = this.playerService.getPlayerById(session.playerId);
    if (!player) return;
    const updated = { ...session, fullName: player.fullName };
    this.storage.set(StorageKeys.session, updated);
    this.sessionSignal.set(updated);
  }

  getUserByPlayerId(playerId: string): User | undefined {
    const users = this.storage.get<User[]>(StorageKeys.users) ?? [];
    return users.find((u) => u.playerId === playerId);
  }

  isAdminPlayer(playerId: string): boolean {
    const user = this.getUserByPlayerId(playerId);
    return user?.role === 'admin';
  }

  updateOwnProfileFields(payload: Partial<PlayerFormValue>): void {
    const session = this.session();
    if (!session) return;
    this.playerService.updatePlayer(session.playerId, payload);
    this.refreshSessionName();
  }
}