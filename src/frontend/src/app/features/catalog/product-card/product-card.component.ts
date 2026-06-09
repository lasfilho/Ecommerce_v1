import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductListItem } from '../../../core/models/catalog.models';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { discountPercent, effectivePrice, hasDiscount } from '../../../shared/utils/product.utils';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CardComponent, BadgeComponent, CurrencyBrlPipe],
  template: `
    <ui-card [hoverable]="true" padding="none">
      <a
        [routerLink]="['/products', product().id]"
        class="group flex h-full flex-col overflow-hidden"
      >
        <div class="relative aspect-[4/5] overflow-hidden bg-surface-muted">
          @if (product().primaryImage?.url; as imageUrl) {
            <img
              [src]="imageUrl"
              [alt]="product().primaryImage?.altText || product().name"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          } @else {
            <div class="flex h-full items-center justify-center text-sm text-ink-faint">
              Sem imagem
            </div>
          }

          @if (hasDiscount(product())) {
            <div class="absolute left-3 top-3">
              <ui-badge variant="accent">-{{ discountPercent(product()) }}%</ui-badge>
            </div>
          }
        </div>

        <div class="flex flex-1 flex-col gap-2 p-4">
          <p class="text-xs font-medium uppercase tracking-wider text-ink-faint">
            {{ product().category.name }}
          </p>
          <h3
            class="font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-brand"
          >
            {{ product().name }}
          </h3>
          @if (product().shortDescription) {
            <p class="line-clamp-2 text-sm text-ink-muted">{{ product().shortDescription }}</p>
          }

          <div class="mt-auto flex items-end justify-between gap-2 pt-2">
            <div class="flex flex-col">
              @if (hasDiscount(product())) {
                <span class="text-xs text-ink-faint line-through">{{
                  product().price | currencyBrl
                }}</span>
              }
              <span class="text-lg font-semibold text-ink">{{
                effectivePrice(product()) | currencyBrl
              }}</span>
            </div>
            @if (product().stockQuantity <= 5) {
              <ui-badge variant="muted">Últimas unidades</ui-badge>
            }
          </div>
        </div>
      </a>
    </ui-card>
  `
})
export class ProductCardComponent {
  readonly product = input.required<ProductListItem>();

  protected readonly effectivePrice = effectivePrice;
  protected readonly hasDiscount = hasDiscount;
  protected readonly discountPercent = discountPercent;
}
