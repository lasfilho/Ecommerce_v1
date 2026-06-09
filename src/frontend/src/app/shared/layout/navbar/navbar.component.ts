import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideLayoutDashboard,
  LucideLogIn,
  LucideLogOut,
  LucideSearch,
  LucideShoppingBag,
  LucideStore,
  LucideUser
} from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    ButtonComponent,
    LucideStore,
    LucideSearch,
    LucideShoppingBag,
    LucideUser,
    LucideLogIn,
    LucideLogOut,
    LucideLayoutDashboard
  ],
  template: `
    <header
      class="sticky top-0 z-50 border-b border-border/80 bg-surface-elevated/90 backdrop-blur-md"
    >
      <div class="page-container flex h-16 items-center justify-between gap-4">
        <a routerLink="/" class="group flex items-center gap-2.5">
          <span
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-soft transition-transform group-hover:scale-105"
          >
            <svg lucideStore [size]="18"></svg>
          </span>
          <div class="leading-tight">
            <p class="font-display text-lg font-semibold tracking-tight text-ink">Atelier</p>
            <p class="text-[10px] uppercase tracking-[0.2em] text-ink-faint">Commerce</p>
          </div>
        </a>

        <nav class="hidden items-center gap-1 md:flex">
          <a
            routerLink="/"
            routerLinkActive="bg-brand-soft text-brand"
            [routerLinkActiveOptions]="{ exact: true }"
            class="rounded-lg px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
          >
            Catálogo
          </a>
          @if (auth.isAuthenticated()) {
            <a
              routerLink="/cart"
              routerLinkActive="bg-brand-soft text-brand"
              class="rounded-lg px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              Carrinho
            </a>
          }
        </nav>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="hidden h-10 w-10 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink sm:flex"
            aria-label="Buscar"
          >
            <svg lucideSearch [size]="18"></svg>
          </button>

          @if (auth.isAuthenticated()) {
            <a
              routerLink="/cart"
              class="relative inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 text-sm font-medium text-ink transition-colors hover:border-border-strong hover:bg-surface-muted"
            >
              <svg lucideShoppingBag [size]="18"></svg>
              <span class="hidden sm:inline">Carrinho</span>
              @if (cart.itemCount() > 0) {
                <span
                  class="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground"
                >
                  {{ cart.itemCount() }}
                </span>
              }
            </a>

            <div class="hidden items-center gap-2 sm:flex">
              @if (auth.isAdmin()) {
                <a
                  routerLink="/admin"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-brand transition-colors hover:bg-brand-soft"
                >
                  <svg lucideLayoutDashboard [size]="14"></svg>
                  Admin
                </a>
              }
              <span
                class="inline-flex items-center gap-1.5 rounded-lg bg-surface-muted px-3 py-2 text-xs font-medium text-ink-muted"
              >
                <svg lucideUser [size]="14"></svg>
                {{ auth.displayName() }}
              </span>
              <ui-button variant="ghost" size="sm" (clicked)="logout()">
                <svg lucideLogOut [size]="16"></svg>
                Sair
              </ui-button>
            </div>
          } @else {
            <a
              routerLink="/auth/login"
              class="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 text-sm font-medium text-ink transition-colors hover:border-border-strong hover:bg-surface-muted"
            >
              <svg lucideLogIn [size]="18"></svg>
              <span class="hidden sm:inline">Entrar</span>
            </a>
          }
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.cart.reset()
    });
  }
}
