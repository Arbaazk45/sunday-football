import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-wrap">
      <p class="demo-banner">
        Demo prototype — authentication is not production-secure (LocalStorage only).
      </p>
      <div class="auth-card">
        <div class="auth-brand">
          <span>⚽</span>
          <h1>Sunday Football</h1>
          <p class="tag">Team Manager</p>
        </div>
        <router-outlet />
      </div>
    </div>
  `,
  styles: `
    .auth-wrap {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem 1rem;
      background: var(--color-bg);
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 1.75rem;
    }
    .auth-brand {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .auth-brand h1 {
      font-size: 1.35rem;
      margin: 0.25rem 0 0;
    }
    .tag {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }
  `,
})
export class AuthLayoutComponent {}