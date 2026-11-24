import { Component, inject, output } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  readonly menuToggle = output<void>();

  readonly session = this.auth.session;

  logout(): void {
    this.auth.logout();
  }
}