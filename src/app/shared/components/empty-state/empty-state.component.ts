import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty">
      <p class="empty__title">{{ title() }}</p>
      @if (description()) {
        <p class="empty__desc">{{ description() }}</p>
      }
    </div>
  `,
  styles: `
    .empty {
      text-align: center;
      padding: 2rem 1rem;
      color: var(--color-text-muted);
    }
    .empty__title {
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 0.35rem;
    }
    .empty__desc {
      font-size: 0.9rem;
      margin: 0;
    }
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
}