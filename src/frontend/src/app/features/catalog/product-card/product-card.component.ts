import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideStar, LucideTruck } from '@lucide/angular';
import { ProductListItem } from '../../../core/models/catalog.models';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { discountPercent, effectivePrice, hasDiscount } from '../../../shared/utils/product.utils';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyBrlPipe, LucideStar, LucideTruck],
  template: `
    <article class="marketplace-card group h-full">
      <a [routerLink]="['/products', product().id]" class="flex h-full flex-col">
        <div class="relative aspect-square overflow-hidden bg-surface-muted">
          @if (product().primaryImage?.url; as imageUrl) {
            <img
              [src]="imageUrl"
              [alt]="product().primaryImage?.altText || product().name"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          } @else {
            <div class="flex h-full items-center justify-center text-xs text-ink-faint">Sem imagem</div>
          }

          @if (hasDiscount(product())) {
            <span class="deal-badge absolute left-0 top-0 rounded-none rounded-br-md px-2 py-1">
              -{{ discountPercent(product()) }}%
            </span>
          }
        </div>

        <div class="flex flex-1 flex-col gap-1.5 p-3">
          <h3 class="line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-ink group-hover:text-brand">
            {{ product().name }}
          </h3>

          <div class="flex items-center gap-1 text-accent">
            @for (star of [1, 2, 3, 4, 5]; track star) {
              <svg
                lucideStar
                [size]="12"
                [class.fill-accent]="star <= 4"
                [class.text-accent]="star <= 4"
                [class.text-border]="star > 4"
              ></svg>
            }
            <span class="ml-1 text-[10px] text-ink-faint">(128)</span>
          </div>

          <div class="mt-auto space-y-0.5">
            @if (hasDiscount(product())) {
              <p class="price-original">{{ product().price | currencyBrl }}</p>
            }
            <p class="price-current">{{ effectivePrice(product()) | currencyBrl }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-1.5 pt-1">
            @if (hasDiscount(product()) || product().price >= 99) {
              <span
                class="inline-flex items-center gap-0.5 rounded-sm bg-success-soft px-1.5 py-0.5 text-[10px] font-medium text-success"
              >
                <svg lucideTruck [size]="10"></svg>
                Frete grátis
              </span>
            }
            @if (product().stockQuantity <= 5 && product().stockQuantity > 0) {
              <span class="text-[10px] font-medium text-deal">Restam {{ product().stockQuantity }}</span>
            }
          </div>
        </div>
      </a>
    </article>
  `
})
export class ProductCardComponent {
  readonly product = input.required<ProductListItem>();

  protected readonly effectivePrice = effectivePrice;
  protected readonly hasDiscount = hasDiscount;
  protected readonly discountPercent = discountPercent;
}
