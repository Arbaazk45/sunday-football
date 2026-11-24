import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: [''],
    password: [''],
  });

  submit(): void {
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    const result = this.auth.login(email, password);
    if (!result.ok) {
      this.error.set(result.error);
      return;
    }
    void this.router.navigate(this.auth.isAdmin() ? ['/admin'] : ['/dashboard']);
  }
}