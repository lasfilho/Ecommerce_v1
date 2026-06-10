import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideMinus, LucidePlus, LucideShieldCheck, LucideShoppingCart, LucideTruck } from '@lucide/angular';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { ProductDetail } from '../../../core/models/catalog.models';
import { AuthService } from '../../../core/services/auth.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { CartService } from '../../../core/services/cart.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { discountPercent, effectivePrice, hasDiscount } from '../../../shared/utils/product.utils';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    CardComponent,
    ButtonComponent,
    CurrencyBrlPipe,
    LucideArrowLeft,
    LucideMinus,
    LucidePlus,
    LucideShoppingCart,
    LucideTruck,
    LucideShieldCheck
  ],
  template: `
    <section class="page-container py-4 sm:py-8">
      <a
        routerLink="/"
        class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline sm:mb-6"
      >
        <svg lucideArrowLeft [size]="16"></svg>
        Continuar comprando
      </a>

      @if (loading()) {
        <div class="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div class="aspect-square animate-pulse rounded-lg bg-surface-muted"></div>
          <div class="h-80 animate-pulse rounded-lg bg-surface-muted"></div>
        </div>
      } @else if (error()) {
        <ui-card>
          <p class="text-danger">{{ error() }}</p>
        </ui-card>
      } @else {
        @if (product(); as item) {
          <div class="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8">
            <div class="space-y-4">
              <div class="marketplace-card overflow-hidden">
                <img
                  [src]="selectedImage()"
                  [alt]="item.name"
                  class="aspect-square w-full object-cover"
                />
              </div>

              @if (item.images.length > 1) {
                <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  @for (image of item.images; track image.id) {
                    <button
                      type="button"
                      class="h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors sm:h-20 sm:w-20"
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

              @if (item.longDescription) {
                <ui-card padding="lg" class="hidden lg:block">
                  <h2 class="text-lg font-bold text-ink">Descrição do produto</h2>
                  <p class="mt-3 whitespace-pre-line text-sm leading-7 text-ink-muted">
                    {{ item.longDescription }}
                  </p>
                </ui-card>
              }
            </div>

            <!-- Buy box -->
            <div class="lg:sticky lg:top-20">
              <ui-card padding="lg" class="border-brand/20 shadow-soft">
                <p class="text-xs font-medium text-brand">{{ item.category.name }}</p>
                <h1 class="mt-1 text-xl font-bold leading-snug text-ink sm:text-2xl">
                  {{ item.name }}
                </h1>
                <p class="mt-1 text-xs text-ink-faint">SKU {{ item.sku }}</p>

                <div class="mt-4 border-b border-border pb-4">
                  @if (hasDiscount(item)) {
                    <span class="deal-badge mr-2">-{{ discountPercent(item) }}%</span>
                    <p class="price-original mt-1">{{ item.price | currencyBrl }}</p>
                    <p class="price-current">{{ effectivePrice(item) | currencyBrl }}</p>
                  } @else {
                    <p class="price-current">{{ item.price | currencyBrl }}</p>
                  }
                  <p class="mt-1 text-xs text-success">Em até 12x sem juros no cartão</p>
                </div>

                <div class="mt-4 space-y-2 text-sm">
                  <div class="flex items-center gap-2 text-success">
                    <svg lucideTruck [size]="16"></svg>
                    <span>Frete grátis para todo o Brasil*</span>
                  </div>
                  <div class="flex items-center gap-2 text-ink-muted">
                    <svg lucideShieldCheck [size]="16"></svg>
                    <span>Compra 100% protegida</span>
                  </div>
                </div>

                @if (item.shortDescription) {
                  <p class="mt-4 text-sm leading-relaxed text-ink-muted">{{ item.shortDescription }}</p>
                }

                <div class="mt-6 space-y-3">
                  <p class="text-sm font-medium text-ink">Quantidade</p>
                  <div class="inline-flex items-center rounded-md border border-border">
                    <button
                      type="button"
                      class="flex h-10 w-10 items-center justify-center hover:bg-surface-muted"
                      (click)="decreaseQuantity()"
                      [disabled]="quantity() <= 1"
                    >
                      <svg lucideMinus [size]="16"></svg>
                    </button>
                    <span class="min-w-10 text-center text-sm font-bold">{{ quantity() }}</span>
                    <button
                      type="button"
                      class="flex h-10 w-10 items-center justify-center hover:bg-surface-muted"
                      (click)="increaseQuantity()"
                      [disabled]="quantity() >= item.stockQuantity"
                    >
                      <svg lucidePlus [size]="16"></svg>
                    </button>
                  </div>

                  <ui-button
                    variant="primary"
                    size="lg"
                    [fullWidth]="true"
                    [loading]="adding()"
                    [disabled]="item.stockQuantity === 0"
                    (clicked)="addToCart()"
                  >
                    <svg lucideShoppingCart [size]="18"></svg>
                    Adicionar ao carrinho
                  </ui-button>

                  <ui-button variant="secondary" size="lg" [fullWidth]="true" [disabled]="true">
                    Comprar agora
                  </ui-button>
                </div>

                @if (item.stockQuantity === 0) {
                  <p class="mt-3 text-sm font-medium text-danger">Produto esgotado</p>
                } @else if (item.stockQuantity <= 5) {
                  <p class="mt-3 text-sm font-medium text-deal">
                    🔥 Apenas {{ item.stockQuantity }} unidades — corre!
                  </p>
                }

                @if (!auth.isAuthenticated()) {
                  <p class="mt-4 text-sm text-ink-muted">
                    <a
                      routerLink="/auth/login"
                      [queryParams]="{ returnUrl: currentUrl }"
                      class="font-semibold text-brand hover:underline"
                    >
                      Faça login
                    </a>
                    para comprar.
                  </p>
                }
              </ui-card>

              @if (item.longDescription) {
                <ui-card padding="lg" class="mt-4 lg:hidden">
                  <h2 class="text-lg font-bold text-ink">Descrição</h2>
                  <p class="mt-3 whitespace-pre-line text-sm leading-7 text-ink-muted">
                    {{ item.longDescription }}
                  </p>
                </ui-card>
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
