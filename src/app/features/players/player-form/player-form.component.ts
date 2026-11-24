import { Component, computed, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PlayerService } from '../../../core/services/player.service';
import { POSITIONS, Position } from '../../../core/models/player.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-player-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './player-form.component.html',
})
export class PlayerFormComponent implements OnInit {
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly players = inject(PlayerService);
  private readonly router = inject(Router);

  readonly positions = POSITIONS;
  readonly isEdit = computed(() => !!this.id());

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    age: [25, [Validators.required, Validators.min(16), Validators.max(60)]],
    position: ['Midfielder' as Position, Validators.required],
    yearsExperience: [3, [Validators.required, Validators.min(0), Validators.max(40)]],
    achievements: [''],
    strengths: ['', Validators.required],
    skillRating: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
    achievementBoost: [0, [Validators.min(0), Validators.max(2)]],
    avatarUrl: [''],
  });

  ngOnInit(): void {
    const editId = this.id();
    if (editId) {
      const p = this.players.getPlayerById(editId);
      if (p) {
        this.form.patchValue({
          fullName: p.fullName,
          email: p.email,
          age: p.age,
          position: p.position,
          yearsExperience: p.yearsExperience,
          achievements: p.achievements,
          strengths: p.strengths,
          skillRating: p.skillRating,
          achievementBoost: p.achievementBoost ?? 0,
          avatarUrl: p.avatarUrl ?? '',
        });
      }
    }
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || file.size > 200_000) return;
    const reader = new FileReader();
    reader.onload = () => this.form.patchValue({ avatarUrl: reader.result as string });
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const editId = this.id();
    if (editId) {
      this.players.updatePlayer(editId, {
        ...v,
        avatarUrl: v.avatarUrl || undefined,
      });
    } else {
      this.players.addPlayer({
        ...v,
        avatarUrl: v.avatarUrl || undefined,
      });
    }
    void this.router.navigate(['/players']);
  }

  deletePlayer(): void {
    const editId = this.id();
    if (!editId || !confirm('Delete this player profile?')) return;
    this.players.deletePlayer(editId);
    void this.router.navigate(['/players']);
  }
}