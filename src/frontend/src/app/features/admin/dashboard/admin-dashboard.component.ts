import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideFolderTree, LucidePackage, LucideShoppingCart, LucideUsers } from '@lucide/angular';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { AdminDashboard } from '../../../core/models/admin.models';
import { AdminDashboardService } from '../../../core/services/admin-dashboard.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { CardComponent } from '../../../shared/ui/card/card.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    CardComponent,
    CurrencyBrlPipe,
    LucidePackage,
    LucideShoppingCart,
    LucideUsers,
    LucideFolderTree
  ],
  template: `
    <div>
      <h1 class="font-display text-2xl font-semibold text-ink">Dashboard</h1>
      <p class="mt-1 text-sm text-ink-muted">Visão geral da operação do e-commerce.</p>

      @if (loading()) {
        <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="h-28 animate-pulse rounded-xl bg-surface-muted"></div>
          }
        </div>
      } @else if (error()) {
        <ui-card class="mt-8">
          <p class="text-danger">{{ error() }}</p>
        </ui-card>
      } @else {
        @if (data(); as stats) {
          <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ui-card padding="md" class="border-l-4 border-l-brand">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    Receita
                  </p>
                  <p class="mt-2 font-display text-2xl font-semibold text-ink">
                    {{ stats.totalRevenue | currencyBrl }}
                  </p>
                </div>
                <svg lucideShoppingCart class="text-brand" [size]="20"></svg>
              </div>
            </ui-card>

            <ui-card padding="md" class="border-l-4 border-l-accent">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    Pedidos
                  </p>
                  <p class="mt-2 font-display text-2xl font-semibold text-ink">
                    {{ stats.totalOrders }}
                  </p>
                  <p class="mt-1 text-xs text-ink-muted">{{ stats.pendingOrders }} pendentes</p>
                </div>
                <svg lucideShoppingCart class="text-accent" [size]="20"></svg>
              </div>
            </ui-card>

            <ui-card padding="md" class="border-l-4 border-l-brand">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    Produtos
                  </p>
                  <p class="mt-2 font-display text-2xl font-semibold text-ink">
                    {{ stats.activeProducts }}
                  </p>
                  <p class="mt-1 text-xs text-ink-muted">
                    {{ stats.lowStockProducts }} com estoque baixo
                  </p>
                </div>
                <svg lucidePackage class="text-brand" [size]="20"></svg>
              </div>
            </ui-card>

            <ui-card padding="md" class="border-l-4 border-l-brand">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    Usuários
                  </p>
                  <p class="mt-2 font-display text-2xl font-semibold text-ink">
                    {{ stats.activeUsers }}
                  </p>
                  <p class="mt-1 text-xs text-ink-muted">{{ stats.totalUsers }} cadastrados</p>
                </div>
                <svg lucideUsers class="text-brand" [size]="20"></svg>
              </div>
            </ui-card>
          </div>

          <div class="mt-8 grid gap-4 md:grid-cols-3">
            <a routerLink="/admin/products" class="block">
              <ui-card [hoverable]="true" padding="md">
                <svg lucidePackage class="text-brand" [size]="22"></svg>
                <h2 class="mt-3 font-display text-lg font-semibold text-ink">Produtos</h2>
                <p class="mt-1 text-sm text-ink-muted">{{ stats.totalProducts }} no catálogo</p>
              </ui-card>
            </a>
            <a routerLink="/admin/categories" class="block">
              <ui-card [hoverable]="true" padding="md">
                <svg lucideFolderTree class="text-brand" [size]="22"></svg>
                <h2 class="mt-3 font-display text-lg font-semibold text-ink">Categorias</h2>
                <p class="mt-1 text-sm text-ink-muted">{{ stats.totalCategories }} categorias</p>
              </ui-card>
            </a>
            <a routerLink="/admin/orders" class="block">
              <ui-card [hoverable]="true" padding="md">
                <svg lucideShoppingCart class="text-brand" [size]="22"></svg>
                <h2 class="mt-3 font-display text-lg font-semibold text-ink">Pedidos</h2>
                <p class="mt-1 text-sm text-ink-muted">Gerenciar status e detalhes</p>
              </ui-card>
            </a>
          </div>
        }
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly dashboard = inject(AdminDashboardService);
  private readonly apiError = inject(ApiErrorService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminDashboard | null>(null);

  ngOnInit(): void {
    this.dashboard
      .getDashboard()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (stats) => this.data.set(stats),
        error: (err) => this.error.set(this.apiError.getMessage(err))
      });
  }
}
