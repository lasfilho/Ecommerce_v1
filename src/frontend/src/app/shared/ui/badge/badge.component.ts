import { Component, input } from '@angular/core';

export type BadgeVariant = 'default' | 'brand' | 'accent' | 'danger' | 'muted';

@Component({
  selector: 'ui-badge',
  standalone: true,
  template: `
    <span [class]="classes()">
      <ng-content />
    </span>
  `
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');

  classes(): string {
    const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

    const variants: Record<BadgeVariant, string> = {
      default: 'bg-surface-muted text-ink-muted',
      brand: 'bg-brand-soft text-brand',
      accent: 'bg-accent-soft text-accent',
      danger: 'bg-danger-soft text-danger',
      muted: 'bg-surface-muted text-ink-faint'
    };

    return `${base} ${variants[this.variant()]}`;
  }
}
