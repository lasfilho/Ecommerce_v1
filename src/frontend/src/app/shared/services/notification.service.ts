import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  type: NotificationType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationSignal = signal<AppNotification | null>(null);
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  readonly notification = this.notificationSignal.asReadonly();

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  clear(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.notificationSignal.set(null);
  }

  private show(type: NotificationType, message: string): void {
    this.clear();
    this.notificationSignal.set({ type, message });
    this.hideTimer = setTimeout(() => this.notificationSignal.set(null), 4500);
  }
}
