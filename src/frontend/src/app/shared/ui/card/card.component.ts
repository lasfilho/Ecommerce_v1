import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: true,
  host: {
    class: 'block h-full'
  },
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `
})
export class CardComponent {
  readonly padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
  readonly hoverable = input(false);
  readonly elevated = input(true);

  classes(): string {
    const padding: Record<string, string> = {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6'
    };

    const parts = [
      'rounded-xl border border-border bg-surface-elevated',
      this.elevated() ? 'shadow-card' : '',
      this.hoverable()
        ? 'transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lift'
        : '',
      padding[this.padding()]
    ];

    return parts.filter(Boolean).join(' ');
  }
}
