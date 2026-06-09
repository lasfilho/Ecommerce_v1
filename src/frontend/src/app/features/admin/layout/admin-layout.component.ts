import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideArrowLeft,
  LucideFolderTree,
  LucideLayoutDashboard,
  LucidePackage,
  LucideShoppingCart,
  LucideStore,
  LucideUsers
} from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';

interface AdminNavItem {
  label: string;
  route: string;
  icon: string;
}

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
    LucideShoppingCart,
    LucideUsers,
    LucideArrowLeft
  ],
  template: `
    <div class="flex min-h-screen bg-surface">
      <aside
        class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface-elevated"
      >
        <div class="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <span
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground"
          >
            <svg lucideStore [size]="18"></svg>
          </span>
          <div class="leading-tight">
            <p class="font-display text-sm font-semibold text-ink">Atelier Admin</p>
            <p class="text-[10px] uppercase tracking-[0.18em] text-ink-faint">Painel</p>
          </div>
        </div>

        <nav class="flex-1 space-y-1 p-4">
          <a
            routerLink="/admin"
            routerLinkActive="bg-brand-soft text-brand"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <svg lucideLayoutDashboard [size]="18"></svg>
            Dashboard
          </a>
          <a
            routerLink="/admin/products"
            routerLinkActive="bg-brand-soft text-brand"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <svg lucidePackage [size]="18"></svg>
            Produtos
          </a>
          <a
            routerLink="/admin/categories"
            routerLinkActive="bg-brand-soft text-brand"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <svg lucideFolderTree [size]="18"></svg>
            Categorias
          </a>
          <a
            routerLink="/admin/orders"
            routerLinkActive="bg-brand-soft text-brand"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <svg lucideShoppingCart [size]="18"></svg>
            Pedidos
          </a>
          <a
            routerLink="/admin/users"
            routerLinkActive="bg-brand-soft text-brand"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <svg lucideUsers [size]="18"></svg>
            Usuários
          </a>
        </nav>

        <div class="border-t border-border p-4">
          <a
            routerLink="/"
            class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-brand"
          >
            <svg lucideArrowLeft [size]="16"></svg>
            Voltar à loja
          </a>
        </div>
      </aside>

      <div class="flex min-h-screen flex-1 flex-col pl-64">
        <header
          class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface-elevated/90 px-8 backdrop-blur-md"
        >
          <p class="text-sm text-ink-muted">Área administrativa</p>
          <p class="text-sm font-medium text-ink">{{ auth.displayName() }}</p>
        </header>
        <main class="flex-1 p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
}
