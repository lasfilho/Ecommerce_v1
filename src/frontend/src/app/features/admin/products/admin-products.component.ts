import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucidePencil, LucidePlus } from '@lucide/angular';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { ProductListItem } from '../../../core/models/catalog.models';
import { AdminCatalogService } from '../../../core/services/admin-catalog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { TableComponent } from '../../../shared/ui/table/table.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    RouterLink,
    ButtonComponent,
    BadgeComponent,
    TableComponent,
    CurrencyBrlPipe,
    LucidePlus,
    LucidePencil
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="font-display text-2xl font-semibold text-ink">Produtos</h1>
          <p class="mt-1 text-sm text-ink-muted">Gerencie catálogo, preços e estoque.</p>
        </div>
        <a routerLink="/admin/products/new">
          <ui-button variant="primary">
            <svg lucidePlus [size]="16"></svg>
            Novo produto
          </ui-button>
        </a>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          [class.bg-brand-soft]="filter() === 'all'"
          [class.text-brand]="filter() === 'all'"
          [class.text-ink-muted]="filter() !== 'all'"
          (click)="setFilter('all')"
        >
          Todos
        </button>
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          [class.bg-brand-soft]="filter() === 'active'"
          [class.text-brand]="filter() === 'active'"
          [class.text-ink-muted]="filter() !== 'active'"
          (click)="setFilter('active')"
        >
          Ativos
        </button>
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          [class.bg-brand-soft]="filter() === 'inactive'"
          [class.text-brand]="filter() === 'inactive'"
          [class.text-ink-muted]="filter() !== 'inactive'"
          (click)="setFilter('inactive')"
        >
          Inativos
        </button>
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          [class.bg-accent]="filter() === 'lowStock'"
          [class.text-white]="filter() === 'lowStock'"
          [class.text-ink-muted]="filter() !== 'lowStock'"
          (click)="setFilter('lowStock')"
        >
          Estoque baixo
        </button>
      </div>

      @if (loading()) {
        <div class="h-64 animate-pulse rounded-xl bg-surface-muted"></div>
      } @else if (error()) {
        <p class="text-danger">{{ error() }}</p>
      } @else {
        <ui-table>
          <thead tableHeader>
            <tr>
              <th>Produto</th>
              <th>SKU</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody tableBody>
            @for (product of filteredProducts(); track product.id) {
              <tr>
                <td class="font-medium">{{ product.name }}</td>
                <td class="text-ink-muted">{{ product.sku }}</td>
                <td>{{ product.category.name }}</td>
                <td>{{ product.price | currencyBrl }}</td>
                <td>
                  <span [class.text-danger]="product.stockQuantity <= 5">{{
                    product.stockQuantity
                  }}</span>
                </td>
                <td>
                  <ui-badge [variant]="product.isActive ? 'brand' : 'muted'">
                    {{ product.isActive ? 'Ativo' : 'Inativo' }}
                  </ui-badge>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <a
                      [routerLink]="['/admin/products', product.id, 'edit']"
                      class="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                    >
                      <svg lucidePencil [size]="14"></svg>
                      Editar
                    </a>
                    <button
                      type="button"
                      class="text-xs text-ink-muted hover:text-ink"
                      (click)="toggleStatus(product)"
                    >
                      {{ product.isActive ? 'Desativar' : 'Ativar' }}
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="py-10 text-center text-ink-muted">
                  Nenhum produto encontrado.
                </td>
              </tr>
            }
          </tbody>
        </ui-table>
      }
    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  private readonly catalog = inject(AdminCatalogService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly products = signal<ProductListItem[]>([]);
  readonly filter = signal<'all' | 'active' | 'inactive' | 'lowStock'>('all');

  readonly filteredProducts = () => {
    const items = this.products();
    switch (this.filter()) {
      case 'active':
        return items.filter((p) => p.isActive);
      case 'inactive':
        return items.filter((p) => !p.isActive);
      case 'lowStock':
        return items.filter((p) => p.isActive && p.stockQuantity <= 5);
      default:
        return items;
    }
  };

  ngOnInit(): void {
    this.load();
  }

  setFilter(filter: 'all' | 'active' | 'inactive' | 'lowStock'): void {
    this.filter.set(filter);
  }

  toggleStatus(product: ProductListItem): void {
    this.catalog
      .setProductStatus(product.id, !product.isActive)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.success(`Produto ${product.isActive ? 'desativado' : 'ativado'}.`);
          this.load();
        },
        error: (err) => this.notifications.error(this.apiError.getMessage(err))
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.catalog
      .listProducts({ pageSize: 100, sortBy: 'createdAt', sortDirection: 'desc' })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (result) => this.products.set(result.items),
        error: (err) => this.error.set(this.apiError.getMessage(err))
      });
  }
}
