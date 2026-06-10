import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideHome, LucideShoppingCart, LucideStore, LucideUser } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-mobile-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideHome, LucideStore, LucideShoppingCart, LucideUser],
  template: `
    <nav
      class="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface-elevated pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden"
      aria-label="Navegação inferior"
    >
      <div class="grid h-14 grid-cols-4">
        <a
          routerLink="/"
          routerLinkActive="text-brand"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-ink-muted"
        >
          <svg lucideHome [size]="20"></svg>
          Início
        </a>
        <a
          routerLink="/"
          class="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-ink-muted"
        >
          <svg lucideStore [size]="20"></svg>
          Ofertas
        </a>
        <a
          routerLink="/cart"
          routerLinkActive="text-brand"
          class="relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-ink-muted"
        >
          <svg lucideShoppingCart [size]="20"></svg>
          Carrinho
          @if (cart.itemCount() > 0) {
            <span
              class="absolute right-[calc(50%-18px)] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-deal px-1 text-[9px] font-bold text-white"
            >
              {{ cart.itemCount() }}
            </span>
          }
        </a>
        @if (auth.isAuthenticated()) {
          <a
            routerLink="/cart"
            class="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-ink-muted"
          >
            <svg lucideUser [size]="20"></svg>
            Conta
          </a>
        } @else {
          <a
            routerLink="/auth/login"
            routerLinkActive="text-brand"
            class="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-ink-muted"
          >
            <svg lucideUser [size]="20"></svg>
            Entrar
          </a>
        }
      </div>
    </nav>
  `
})
export class MobileBottomNavComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
}
