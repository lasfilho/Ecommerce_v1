import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  host: {
    class: 'inline-flex'
  },
  template: `
    <button
      [attr.type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
      (click)="onClick($event)"
    >
      @if (loading()) {
        <span
          class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        ></span>
      }
      <ng-content />
    </button>
  `
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);
  readonly clicked = output<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }

  classes(): string {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const sizes: Record<ButtonSize, string> = {
      sm: 'h-9 px-3.5 text-sm',
      md: 'h-11 px-5 text-sm',
      lg: 'h-12 px-6 text-base'
    };

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-brand text-brand-foreground shadow-sm hover:bg-brand-hover active:scale-[0.98]',
      secondary:
        'border border-border bg-surface-elevated text-ink hover:border-border-strong hover:bg-surface-muted',
      ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink',
      danger: 'bg-danger text-white hover:bg-red-700'
    };

    const width = this.fullWidth() ? 'w-full' : '';

    return [base, sizes[this.size()], variants[this.variant()], width].join(' ');
  }
}
