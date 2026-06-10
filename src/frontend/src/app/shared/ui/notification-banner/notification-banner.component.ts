import { Component, computed, inject } from '@angular/core';
import { LucideCircleCheck, LucideCircleX, LucideInfo } from '@lucide/angular';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [LucideCircleCheck, LucideCircleX, LucideInfo],
  template: `
    @if (notificationService.notification(); as note) {
      <div class="fixed bottom-4 left-4 right-4 z-[100] sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm">
        <div
          class="flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lift backdrop-blur-md"
          [class]="bannerClasses()"
        >
          @switch (note.type) {
            @case ('success') {
              <svg lucideCircleCheck class="mt-0.5 shrink-0 text-brand" [size]="18"></svg>
            }
            @case ('error') {
              <svg lucideCircleX class="mt-0.5 shrink-0 text-danger" [size]="18"></svg>
            }
            @default {
              <svg lucideInfo class="mt-0.5 shrink-0 text-ink-muted" [size]="18"></svg>
            }
          }
          <p class="text-sm font-medium text-ink">{{ note.message }}</p>
          <button
            type="button"
            class="ml-auto text-ink-faint hover:text-ink"
            (click)="notificationService.clear()"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      </div>
    }
  `
})
export class NotificationBannerComponent {
  readonly notificationService = inject(NotificationService);

  readonly bannerClasses = computed(() => {
    const type = this.notificationService.notification()?.type;
    switch (type) {
      case 'success':
        return 'border-brand border-opacity-30 bg-brand-soft';
      case 'error':
        return 'border-danger border-opacity-30 bg-danger-soft';
      default:
        return 'border-border bg-surface-elevated';
    }
  });
}
