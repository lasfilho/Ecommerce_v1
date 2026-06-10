import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideArrowLeft,
  LucideFolderTree,
  LucideLayoutDashboard,
  LucideMegaphone,
  LucideMenu,
  LucidePackage,
  LucideShoppingCart,
  LucideStore,
  LucideUsers,
  LucideX
} from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideStore,
    LucideLayoutDashboard,
    LucidePackage,
    LucideFolderTree,
    LucideMegaphone,
    LucideShoppingCart,
    LucideUsers,
    LucideArrowLeft,
    LucideMenu,
    LucideX
  ],
  template: `
    <div class="flex min-h-screen bg-surface">
      @if (sidebarOpen()) {
        <button
          type="button"
          class="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          aria-label="Fechar menu"
          (click)="closeSidebar()"
        ></button>
      }

      <aside
        class="fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-border bg-surface-elevated transition-transform duration-200 ease-in-out lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
      >
        <div class="flex h-16 items-center justify-between gap-2 border-b border-border px-4 sm:px-5">
          <div class="flex items-center gap-2.5">
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground"
            >
              <svg lucideStore [size]="18"></svg>
            </span>
            <div class="leading-tight">
              <p class="font-display text-sm font-semibold text-ink">Atelier Admin</p>
              <p class="text-[10px] uppercase tracking-[0.18em] text-ink-faint">Painel</p>
            </div>
          </div>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted lg:hidden"
            aria-label="Fechar menu"
            (click)="closeSidebar()"
          >
            <svg lucideX [size]="20"></svg>
          </button>
        </div>

        <nav class="flex-1 space-y-1 overflow-y-auto p-4">
          <a
            routerLink="/admin"
            routerLinkActive="bg-brand-soft text-brand"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            (click)="closeSidebar()"
          >
            <svg lucideLayoutDashboard [size]="18"></svg>
            Dashboard
          </a>
          <a
            routerLink="/admin/products"
            routerLinkActive="bg-brand-soft text-brand"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            (click)="closeSidebar()"
          >
            <svg lucidePackage [size]="18"></svg>
            Produtos
          </a>
          <a
            routerLink="/admin/categories"
            routerLinkActive="bg-brand-soft text-brand"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            (click)="closeSidebar()"
          >
            <svg lucideFolderTree [size]="18"></svg>
            Categorias
          </a>
          <a
            routerLink="/admin/promotions"
            routerLinkActive="bg-brand-soft text-brand"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            (click)="closeSidebar()"
          >
            <svg lucideMegaphone [size]="18"></svg>
            Promoções
          </a>
          <a
            routerLink="/admin/orders"
            routerLinkActive="bg-brand-soft text-brand"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            (click)="closeSidebar()"
          >
            <svg lucideShoppingCart [size]="18"></svg>
            Pedidos
          </a>
          <a
            routerLink="/admin/users"
            routerLinkActive="bg-brand-soft text-brand"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            (click)="closeSidebar()"
          >
            <svg lucideUsers [size]="18"></svg>
            Usuários
          </a>
        </nav>

        <div class="border-t border-border p-4">
          <a
            routerLink="/"
            class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-brand"
            (click)="closeSidebar()"
          >
            <svg lucideArrowLeft [size]="16"></svg>
            Voltar à loja
          </a>
        </div>
      </aside>

      <div class="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
        <header
          class="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface-elevated/90 px-4 backdrop-blur-md sm:px-6 lg:px-8"
        >
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink lg:hidden"
              aria-label="Abrir menu"
              (click)="openSidebar()"
            >
              <svg lucideMenu [size]="20"></svg>
            </button>
            <p class="truncate text-sm text-ink-muted">Área administrativa</p>
          </div>
          <p class="truncate text-sm font-medium text-ink">{{ auth.displayName() }}</p>
        </header>
        <main class="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  readonly sidebarOpen = signal(false);

  openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
