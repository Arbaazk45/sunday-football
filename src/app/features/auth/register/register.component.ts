import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { POSITIONS } from '../../../core/models/player.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly positions = POSITIONS;
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    age: [25, [Validators.required, Validators.min(16), Validators.max(60)]],
    position: ['Midfielder' as const, Validators.required],
    yearsExperience: [3, [Validators.required, Validators.min(0), Validators.max(40)]],
    achievements: [''],
    strengths: ['', Validators.required],
    skillRating: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
    avatarUrl: [''],
  });

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 200_000) {
      this.error.set('Image must be under 200KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.form.patchValue({ avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const result = this.auth.register({
      ...v,
      avatarUrl: v.avatarUrl || undefined,
    });
    if (!result.ok) {
      this.error.set(result.error);
      return;
    }
    void this.router.navigate(['/dashboard']);
  }
}