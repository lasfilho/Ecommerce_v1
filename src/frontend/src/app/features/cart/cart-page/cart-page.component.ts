import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { LucideMinus, LucidePlus, LucideShoppingBag, LucideTrash2 } from '@lucide/angular';
import { finalize } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    RouterLink,
    CardComponent,
    ButtonComponent,
    CurrencyBrlPipe,
    LucideShoppingBag,
    LucideMinus,
    LucidePlus,
    LucideTrash2
  ],
  template: `
    <section class="page-container py-10 sm:py-14">
      <div class="mb-8">
        <h1 class="section-title">Seu carrinho</h1>
        <p class="section-subtitle">Revise itens e quantidades antes de finalizar o pedido.</p>
      </div>

      @if (cart.loading()) {
        <div class="space-y-4">
          @for (i of [1, 2]; track i) {
            <div class="h-28 animate-pulse rounded-xl bg-surface-muted"></div>
          }
        </div>
      } @else if (error()) {
        <ui-card padding="lg" class="max-w-xl">
          <p class="text-danger">{{ error() }}</p>
          <ui-button class="mt-4" variant="primary" (clicked)="reload()"
            >Tentar novamente</ui-button
          >
        </ui-card>
      } @else if (cart.isEmpty()) {
        <ui-card padding="lg" class="max-w-xl text-center">
          <svg lucideShoppingBag class="mx-auto text-ink-faint" [size]="36"></svg>
          <h2 class="mt-4 font-display text-xl font-semibold text-ink">Carrinho vazio</h2>
          <p class="mt-2 text-sm text-ink-muted">Explore o catálogo e adicione seus favoritos.</p>
          <ui-button class="mt-6" variant="primary" (clicked)="goToCatalog()"
            >Ver catálogo</ui-button
          >
        </ui-card>
      } @else {
        <div class="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div class="space-y-4">
            @for (item of cart.cart()!.items; track item.id) {
              <ui-card padding="md">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <a
                      [routerLink]="['/products', item.productId]"
                      class="font-display text-lg font-semibold text-ink transition-colors hover:text-brand"
                    >
                      {{ item.productName }}
                    </a>
                    <p class="mt-1 text-xs text-ink-faint">SKU {{ item.sku }}</p>
                    <p class="mt-2 text-sm font-medium text-ink">
                      {{ item.unitPrice | currencyBrl }}
                    </p>
                    @if (!item.isAvailable) {
                      <p class="mt-1 text-xs text-danger">Indisponível</p>
                    }
                  </div>

                  <div class="flex items-center gap-4">
                    <div class="inline-flex items-center rounded-lg border border-border">
                      <button
                        type="button"
                        class="flex h-10 w-10 items-center justify-center"
                        (click)="updateQuantity(item.productId, item.quantity - 1)"
                        [disabled]="item.quantity <= 1 || updating()"
                      >
                        <svg lucideMinus [size]="14"></svg>
                      </button>
                      <span class="min-w-8 text-center text-sm font-semibold">{{
                        item.quantity
                      }}</span>
                      <button
                        type="button"
                        class="flex h-10 w-10 items-center justify-center"
                        (click)="updateQuantity(item.productId, item.quantity + 1)"
                        [disabled]="item.quantity >= item.availableStock || updating()"
                      >
                        <svg lucidePlus [size]="14"></svg>
                      </button>
                    </div>

                    <p class="min-w-24 text-right font-semibold text-ink">
                      {{ item.lineTotal | currencyBrl }}
                    </p>

                    <button
                      type="button"
                      class="text-ink-faint transition-colors hover:text-danger"
                      (click)="removeItem(item.productId)"
                      [disabled]="updating()"
                      aria-label="Remover item"
                    >
                      <svg lucideTrash2 [size]="18"></svg>
                    </button>
                  </div>
                </div>
              </ui-card>
            }

            <ui-button variant="ghost" [disabled]="updating()" (clicked)="clearCart()"
              >Limpar carrinho</ui-button
            >
          </div>

          <ui-card padding="lg" class="h-fit">
            <h2 class="font-display text-lg font-semibold text-ink">Resumo</h2>
            <div class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between text-ink-muted">
                <span>Itens</span>
                <span>{{ cart.itemCount() }}</span>
              </div>
              <div
                class="flex justify-between border-t border-border pt-3 text-base font-semibold text-ink"
              >
                <span>Subtotal</span>
                <span>{{ cart.subtotal() | currencyBrl }}</span>
              </div>
            </div>
            <p class="mt-4 text-xs text-ink-faint">Frete calculado no checkout (backend).</p>
            <ui-button class="mt-6" variant="primary" [fullWidth]="true"
              >Finalizar compra</ui-button
            >
          </ui-card>
        </div>
      }
    </section>
  `
})
export class CartPageComponent implements OnInit {
  readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly updating = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.error.set(null);
    this.cart
      .refresh()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => this.error.set('Não foi possível carregar o carrinho. Tente novamente.')
      });
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) return;
    this.updating.set(true);
    this.cart
      .updateQuantity(productId, quantity)
      .pipe(
        finalize(() => this.updating.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  removeItem(productId: string): void {
    this.updating.set(true);
    this.cart
      .removeItem(productId)
      .pipe(
        finalize(() => this.updating.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  clearCart(): void {
    this.updating.set(true);
    this.cart
      .clear()
      .pipe(
        finalize(() => this.updating.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  goToCatalog(): void {
    void this.router.navigate(['/']);
  }
}
