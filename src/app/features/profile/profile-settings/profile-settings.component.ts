import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';
import { POSITIONS, Position } from '../../../core/models/player.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './profile-settings.component.html',
})
export class ProfileSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly players = inject(PlayerService);

  readonly positions = POSITIONS;
  readonly saved = signal(false);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    age: [25, [Validators.required, Validators.min(16), Validators.max(60)]],
    position: ['Midfielder' as Position, Validators.required],
    yearsExperience: [0, [Validators.required, Validators.min(0)]],
    achievements: [''],
    strengths: ['', Validators.required],
    skillRating: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
    avatarUrl: [''],
  });

  ngOnInit(): void {
    const id = this.auth.currentPlayerId();
    if (!id) return;
    const p = this.players.getPlayerById(id);
    if (!p) return;
    this.form.patchValue({
      fullName: p.fullName,
      age: p.age,
      position: p.position,
      yearsExperience: p.yearsExperience,
      achievements: p.achievements,
      strengths: p.strengths,
      skillRating: p.skillRating,
      avatarUrl: p.avatarUrl ?? '',
    });
    if (!this.auth.isAdmin()) {
      this.form.controls.skillRating.disable();
      this.form.controls.position.disable();
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
    const raw = this.form.getRawValue();
    this.auth.updateOwnProfileFields({
      ...raw,
      avatarUrl: raw.avatarUrl || undefined,
    });
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }
}