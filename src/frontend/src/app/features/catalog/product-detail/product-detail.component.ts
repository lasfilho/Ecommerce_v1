import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideMinus, LucidePlus, LucideShoppingBag } from '@lucide/angular';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { ProductDetail } from '../../../core/models/catalog.models';
import { AuthService } from '../../../core/services/auth.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { CartService } from '../../../core/services/cart.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { discountPercent, effectivePrice, hasDiscount } from '../../../shared/utils/product.utils';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    CurrencyBrlPipe,
    LucideArrowLeft,
    LucideMinus,
    LucidePlus,
    LucideShoppingBag
  ],
  template: `
    <section class="page-container py-8 sm:py-12">
      <a
        routerLink="/"
        class="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-brand"
      >
        <svg lucideArrowLeft [size]="16"></svg>
        Voltar ao catálogo
      </a>

      @if (loading()) {
        <div class="grid gap-8 lg:grid-cols-2">
          <div class="aspect-square animate-pulse rounded-xl bg-surface-muted"></div>
          <div class="space-y-4">
            <div class="h-8 w-2/3 animate-pulse rounded bg-surface-muted"></div>
            <div class="h-4 w-full animate-pulse rounded bg-surface-muted"></div>
            <div class="h-4 w-4/5 animate-pulse rounded bg-surface-muted"></div>
          </div>
        </div>
      } @else if (error()) {
        <ui-card>
          <p class="text-danger">{{ error() }}</p>
        </ui-card>
      } @else {
        @if (product(); as item) {
          <div class="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div class="space-y-4">
              <div
                class="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-soft"
              >
                <img
                  [src]="selectedImage()"
                  [alt]="item.name"
                  class="aspect-square w-full object-cover"
                />
              </div>

              @if (item.images.length > 1) {
                <div class="flex gap-3 overflow-x-auto pb-1">
                  @for (image of item.images; track image.id) {
                    <button
                      type="button"
                      class="h-20 w-20 shrink-0 overflow-hidden rounded-lg border transition-colors"
                      [class.border-brand]="selectedImage() === image.url"
                      [class.border-border]="selectedImage() !== image.url"
                      (click)="selectedImageUrl.set(image.url)"
                    >
                      <img
                        [src]="image.url"
                        [alt]="image.altText || item.name"
                        class="h-full w-full object-cover"
                      />
                    </button>
                  }
                </div>
              }
            </div>

            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                {{ item.category.name }}
              </p>
              <h1
                class="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
              >
                {{ item.name }}
              </h1>
              <p class="mt-2 text-sm text-ink-faint">SKU {{ item.sku }}</p>

              <div class="mt-6 flex flex-wrap items-center gap-3">
                @if (hasDiscount(item)) {
                  <span class="text-lg text-ink-faint line-through">{{
                    item.price | currencyBrl
                  }}</span>
                  <span class="font-display text-3xl font-semibold text-ink">{{
                    effectivePrice(item) | currencyBrl
                  }}</span>
                  <ui-badge variant="accent">-{{ discountPercent(item) }}%</ui-badge>
                } @else {
                  <span class="font-display text-3xl font-semibold text-ink">{{
                    item.price | currencyBrl
                  }}</span>
                }
              </div>

              @if (item.shortDescription) {
                <p class="mt-6 text-base leading-relaxed text-ink-muted">
                  {{ item.shortDescription }}
                </p>
              }

              <div class="mt-8 flex flex-wrap items-center gap-4">
                <div
                  class="inline-flex items-center rounded-lg border border-border bg-surface-elevated"
                >
                  <button
                    type="button"
                    class="flex h-11 w-11 items-center justify-center text-ink-muted hover:text-ink"
                    (click)="decreaseQuantity()"
                    [disabled]="quantity() <= 1"
                  >
                    <svg lucideMinus [size]="16"></svg>
                  </button>
                  <span class="min-w-10 text-center text-sm font-semibold">{{ quantity() }}</span>
                  <button
                    type="button"
                    class="flex h-11 w-11 items-center justify-center text-ink-muted hover:text-ink"
                    (click)="increaseQuantity()"
                    [disabled]="quantity() >= item.stockQuantity"
                  >
                    <svg lucidePlus [size]="16"></svg>
                  </button>
                </div>

                <ui-button
                  variant="primary"
                  size="lg"
                  [loading]="adding()"
                  [disabled]="item.stockQuantity === 0"
                  (clicked)="addToCart()"
                >
                  <svg lucideShoppingBag [size]="18"></svg>
                  Adicionar ao carrinho
                </ui-button>
              </div>

              @if (item.stockQuantity === 0) {
                <p class="mt-3 text-sm text-danger">Produto esgotado</p>
              } @else if (item.stockQuantity <= 5) {
                <p class="mt-3 text-sm text-accent">
                  Apenas {{ item.stockQuantity }} unidades disponíveis
                </p>
              }

              @if (!auth.isAuthenticated()) {
                <p class="mt-4 text-sm text-ink-muted">
                  <a
                    routerLink="/auth/login"
                    [queryParams]="{ returnUrl: currentUrl }"
                    class="font-medium text-brand hover:underline"
                  >
                    Faça login
                  </a>
                  para adicionar itens ao carrinho.
                </p>
              }

              @if (item.longDescription) {
                <div class="mt-10">
                  <ui-card padding="lg">
                    <h2 class="font-display text-xl font-semibold text-ink">Descrição</h2>
                    <p class="mt-3 whitespace-pre-line text-sm leading-7 text-ink-muted">
                      {{ item.longDescription }}
                    </p>
                  </ui-card>
                </div>
              }
            </div>
          </div>
        }
      }
    </section>
  `
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);
  readonly auth = inject(AuthService);
  private readonly apiError = inject(ApiErrorService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly product = signal<ProductDetail | null>(null);
  readonly quantity = signal(1);
  readonly adding = signal(false);
  readonly selectedImageUrl = signal<string | null>(null);

  readonly currentUrl = this.router.url;

  readonly selectedImage = computed(() => {
    const item = this.product();
    if (!item) return '';
    return this.selectedImageUrl() ?? item.images[0]?.url ?? item.primaryImage?.url ?? '';
  });

  protected readonly effectivePrice = effectivePrice;
  protected readonly hasDiscount = hasDiscount;
  protected readonly discountPercent = discountPercent;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Produto inválido.');
      this.loading.set(false);
      return;
    }

    this.catalog
      .getProductById(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (product) => {
          this.product.set(product);
          this.selectedImageUrl.set(product.images[0]?.url ?? product.primaryImage?.url ?? null);
        },
        error: (err) => this.error.set(this.apiError.getMessage(err))
      });
  }

  decreaseQuantity(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  increaseQuantity(): void {
    const max = this.product()?.stockQuantity ?? 1;
    this.quantity.update((q) => Math.min(max, q + 1));
  }

  addToCart(): void {
    const item = this.product();
    if (!item) return;

    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    this.adding.set(true);

    this.cart
      .addItem(item.id, this.quantity())
      .pipe(
        finalize(() => this.adding.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        error: (err) => {
          if (this.apiError.isUnauthorized(err)) {
            void this.router.navigate(['/auth/login'], {
              queryParams: { returnUrl: this.router.url }
            });
          }
        }
      });
  }
}
