import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LucideSearch, LucideSlidersHorizontal } from '@lucide/angular';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { ProductListItem } from '../../../core/models/catalog.models';
import { CatalogService } from '../../../core/services/catalog.service';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    FormsModule,
    ProductCardComponent,
    InputComponent,
    LucideSearch,
    LucideSlidersHorizontal
  ],
  template: `
    <section class="page-container py-10 sm:py-14">
      <div class="max-w-3xl">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Curadoria</p>
        <h1 class="section-title mt-2">Produtos selecionados</h1>
        <p class="section-subtitle">
          Visual refinado, carregamento rápido e experiência pensada para compra sem fricção.
        </p>
      </div>

      <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="w-full max-w-md">
          <ui-input
            label="Buscar"
            placeholder="Nome ou descrição..."
            type="search"
            [(ngModel)]="searchTerm"
            (ngModelChange)="applySearch()"
          />
        </div>

        <div class="flex items-center gap-2 text-sm text-ink-muted">
          <svg lucideSlidersHorizontal [size]="16"></svg>
          <select
            class="h-11 rounded-lg border border-border bg-surface-elevated px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            [value]="sortBy"
            (change)="onSortChange($event)"
          >
            <option value="createdAt">Mais recentes</option>
            <option value="price">Menor preço</option>
            <option value="name">Nome A–Z</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for (skeleton of [1, 2, 3, 4, 5, 6, 7, 8]; track skeleton) {
            <div class="animate-pulse rounded-xl border border-border bg-surface-elevated">
              <div class="aspect-[4/5] bg-surface-muted"></div>
              <div class="space-y-3 p-4">
                <div class="h-3 w-1/3 rounded bg-surface-muted"></div>
                <div class="h-5 w-2/3 rounded bg-surface-muted"></div>
                <div class="h-4 w-full rounded bg-surface-muted"></div>
              </div>
            </div>
          }
        </div>
      } @else if (error()) {
        <div class="mt-10 rounded-xl border border-danger/20 bg-danger-soft p-6 text-danger">
          {{ error() }}
        </div>
      } @else if (filteredProducts().length === 0) {
        <div class="mt-10 rounded-xl border border-border bg-surface-elevated p-10 text-center">
          <svg lucideSearch class="mx-auto text-ink-faint" [size]="32"></svg>
          <p class="mt-4 font-medium text-ink">Nenhum produto encontrado</p>
          <p class="mt-1 text-sm text-ink-muted">Tente outro termo ou volte mais tarde.</p>
        </div>
      } @else {
        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for (product of filteredProducts(); track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      }
    </section>
  `
})
export class ProductListComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly apiError = inject(ApiErrorService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly products = signal<ProductListItem[]>([]);
  readonly filteredProducts = signal<ProductListItem[]>([]);

  searchTerm = '';
  sortBy: 'name' | 'price' | 'createdAt' = 'createdAt';

  ngOnInit(): void {
    this.loadProducts();
  }

  applySearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredProducts.set(this.products());
      return;
    }

    this.filteredProducts.set(
      this.products().filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.shortDescription?.toLowerCase().includes(term) ||
          p.category.name.toLowerCase().includes(term)
      )
    );
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'name' | 'price' | 'createdAt';
    this.sortBy = value;
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.catalog
      .listProducts({
        pageSize: 24,
        sortBy: this.sortBy,
        sortDirection: this.sortBy === 'price' ? 'asc' : this.sortBy === 'name' ? 'asc' : 'desc'
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (result) => {
          this.products.set(result.items);
          this.applySearch();
        },
        error: (err) => this.error.set(this.apiError.getMessage(err))
      });
  }
}
