import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { NotificationBannerComponent } from './shared/ui/notification-banner/notification-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationBannerComponent],
  template: `
    <router-outlet />
    <app-notification-banner />
  `
})
export class AppComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.auth
      .initialize()
      .pipe(
        switchMap(() => (this.auth.isAuthenticated() ? this.cart.refresh() : of(null))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
}
