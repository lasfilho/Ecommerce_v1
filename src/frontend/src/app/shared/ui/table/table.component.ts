import { Component } from '@angular/core';

@Component({
  selector: 'ui-table',
  standalone: true,
  template: `
    <div class="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-soft">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-left text-sm">
          <ng-content select="[tableHeader]" />
          <ng-content select="[tableBody]" />
        </table>
      </div>
    </div>
  `,
  styles: `
    :host ::ng-deep thead {
      background: var(--color-surface-muted, #f4f4f5);
    }
    :host ::ng-deep th {
      padding: 0.75rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-ink-muted, #71717a);
    }
    :host ::ng-deep td {
      padding: 0.875rem 1rem;
      border-top: 1px solid var(--color-border, #e4e4e7);
      color: var(--color-ink, #18181b);
      vertical-align: middle;
    }
    :host ::ng-deep tbody tr:hover {
      background: color-mix(in srgb, var(--color-brand, #4f46e5) 4%, transparent);
    }
  `
})
export class TableComponent {}
