import { Component, input } from '@angular/core';
import { InitialsPipe } from '../../pipes/initials.pipe';

@Component({
  selector: 'app-player-avatar',
  standalone: true,
  imports: [InitialsPipe],
  template: `
    @if (avatarUrl()) {
      <img class="avatar" [src]="avatarUrl()" [alt]="name()" />
    } @else {
      <span class="avatar avatar--initials">{{ name() | initials }}</span>
    }
  `,
  styles: `
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
    .avatar--initials {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--color-primary-light);
      color: var(--color-primary);
      font-size: 0.85rem;
      font-weight: 600;
    }
  `,
})
export class PlayerAvatarComponent {
  readonly name = input.required<string>();
  readonly avatarUrl = input<string | undefined>();
}