import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCreditCard,
  LucidePercent,
  LucideRotateCcw,
  LucideShieldCheck,
  LucideSlidersHorizontal,
  LucideTruck
} from '@lucide/angular';
import { finalize, switchMap, catchError, of } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { CategorySummary, ProductListItem } from '../../../core/models/catalog.models';
import {
  Promotion,
  PromotionBanner,
  promotionBannerBackground,
  promotionBannerClass
} from '../../../core/models/promotion.models';
import { CatalogService } from '../../../core/services/catalog.service';
import { PromotionsService } from '../../../core/services/promotions.service';
import { hasDiscount } from '../../../shared/utils/product.utils';
import { ProductCardComponent } from '../product-card/product-card.component';
import { PromoCarouselComponent } from '../promo-carousel/promo-carousel.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    ProductCardComponent,
    PromoCarouselComponent,
    LucideTruck,
    LucideCreditCard,
    LucideShieldCheck,
    LucideRotateCcw,
    LucidePercent,
    LucideSlidersHorizontal,
    LucideArrowLeft
  ],
  template: `
    @if (!hasActiveFilters()) {
      @if (bannerSlides().length > 0) {
        <app-promo-carousel [slides]="bannerSlides()" />
      }

      <!-- Trust bar -->
      <section class="border-b border-border bg-surface-elevated">
        <div
          class="page-container grid grid-cols-2 gap-3 py-4 text-center sm:grid-cols-4 sm:gap-4"
        >
          <div class="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-center">
            <svg lucideTruck class="text-brand" [size]="22"></svg>
            <div class="text-left">
              <p class="text-xs font-bold text-ink">Frete grátis</p>
              <p class="text-[10px] text-ink-muted">Acima de R$ 99</p>
            </div>
          </div>
          <div class="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-center">
            <svg lucideCreditCard class="text-brand" [size]="22"></svg>
            <div class="text-left">
              <p class="text-xs font-bold text-ink">Parcelamento</p>
              <p class="text-[10px] text-ink-muted">Em até 12x sem juros</p>
            </div>
          </div>
          <div class="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-center">
            <svg lucideShieldCheck class="text-brand" [size]="22"></svg>
            <div class="text-left">
              <p class="text-xs font-bold text-ink">Compra segura</p>
              <p class="text-[10px] text-ink-muted">Dados protegidos</p>
            </div>
          </div>
          <div class="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-center">
            <svg lucideRotateCcw class="text-brand" [size]="22"></svg>
            <div class="text-left">
              <p class="text-xs font-bold text-ink">Devolução fácil</p>
              <p class="text-[10px] text-ink-muted">Até 30 dias</p>
            </div>
          </div>
        </div>
      </section>
    } @else {
      @if (activePromoBanner(); as promoBanner) {
      <!-- Cabeçalho da página de promoção -->
      <section
        [class]="bannerClass(promoBanner.backgroundClass) ?? ''"
        [style.background-color]="bannerBackground(promoBanner.backgroundClass)"
      >
        <div class="page-container py-6 sm:py-8">
          <button
            type="button"
            class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white"
            (click)="clearFilters()"
          >
            <svg lucideArrowLeft [size]="16"></svg>
            Voltar ao início
          </button>
          <span
            class="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
          >
            {{ promoBanner.tag }}
          </span>
          <h1 class="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
            {{ activePromo()?.title ?? promoBanner.title }}
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
            {{ activePromo()?.subtitle ?? promoBanner.subtitle }}
          </p>
        </div>
      </section>
      }
    }

    <section class="page-container py-6 sm:py-8">
      <!-- Ofertas relâmpago -->
      @if (!hasActiveFilters() && dealProducts().length > 0 && !loading()) {
        <div class="mb-8">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg lucidePercent class="text-deal" [size]="22"></svg>
              <h2 class="section-title">Ofertas relâmpago</h2>
            </div>
            <button
              type="button"
              class="rounded bg-deal px-2 py-0.5 text-xs font-bold text-white hover:bg-brand-hover"
              (click)="goToPromo('mega-ofertas')"
            >
              Ver todas
            </button>
          </div>
          <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            @for (product of dealProducts(); track product.id) {
              <div class="w-40 shrink-0 sm:w-48">
                <app-product-card [product]="product" />
              </div>
            }
          </div>
        </div>
      }

      <!-- Cabeçalho listagem (busca / categoria sem banner dedicado) -->
      @if (hasActiveFilters() && !activePromoBanner()) {
        <div class="mb-4">
          <button
            type="button"
            class="mb-3 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            (click)="clearFilters()"
          >
            <svg lucideArrowLeft [size]="16"></svg>
            Voltar ao início
          </button>
          @if (activeCategoryName()) {
            <h2 class="section-title">{{ activeCategoryName() }}</h2>
          } @else if (searchTerm()) {
            <h2 class="section-title">Resultados para "{{ searchTerm() }}"</h2>
          }
          <p class="section-subtitle">{{ filteredProducts().length }} produto(s) encontrado(s)</p>
        </div>
      } @else if (!hasActiveFilters()) {
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="section-title">Recomendados para você</h2>
            <p class="section-subtitle">{{ filteredProducts().length }} produto(s)</p>
          </div>
          <div class="flex items-center gap-2">
            <svg lucideSlidersHorizontal class="text-ink-muted" [size]="16"></svg>
            <select
              class="h-10 rounded-md border border-border bg-surface-elevated px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              [value]="sortBy"
              (change)="onSortChange($event)"
            >
              <option value="createdAt">Mais recentes</option>
              <option value="price">Menor preço</option>
              <option value="name">Nome A–Z</option>
            </select>
          </div>
        </div>
      } @else {
        <div class="mb-4 flex items-center justify-between gap-3">
          <p class="section-subtitle">{{ filteredProducts().length }} produto(s) nesta promoção</p>
          <div class="flex items-center gap-2">
            <svg lucideSlidersHorizontal class="text-ink-muted" [size]="16"></svg>
            <select
              class="h-10 rounded-md border border-border bg-surface-elevated px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              [value]="sortBy"
              (change)="onSortChange($event)"
            >
              <option value="createdAt">Mais recentes</option>
              <option value="price">Menor preço</option>
              <option value="name">Nome A–Z</option>
            </select>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          @for (skeleton of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; track skeleton) {
            <div class="marketplace-card animate-pulse">
              <div class="aspect-square bg-surface-muted"></div>
              <div class="space-y-2 p-3">
                <div class="h-3 w-full rounded bg-surface-muted"></div>
                <div class="h-4 w-2/3 rounded bg-surface-muted"></div>
              </div>
            </div>
          }
        </div>
      } @else if (error()) {
        <div class="rounded-lg border border-danger/30 bg-danger-soft p-6 text-center text-danger">
          {{ error() }}
        </div>
      } @else if (filteredProducts().length === 0) {
        <div class="rounded-lg border border-border bg-surface-elevated p-12 text-center">
          <p class="font-semibold text-ink">Nenhum produto encontrado</p>
          <p class="mt-1 text-sm text-ink-muted">
            @if (promoSlug()) {
              Esta promoção ainda não tem produtos cadastrados.
            } @else {
              Tente outro termo ou categoria.
            }
          </p>
          <button
            type="button"
            class="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
            (click)="clearFilters()"
          >
            Ver todos os produtos
          </button>
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          @for (product of filteredProducts(); track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      }
    </section>
  `
})
export class ProductListComponent implements OnInit {
  protected readonly bannerBackground = promotionBannerBackground;
  protected readonly bannerClass = promotionBannerClass;

  private readonly catalog = inject(CatalogService);
  private readonly promotionsService = inject(PromotionsService);
  private readonly apiError = inject(ApiErrorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly bannerSlides = signal<PromotionBanner[]>([]);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly products = signal<ProductListItem[]>([]);
  readonly categories = signal<CategorySummary[]>([]);
  readonly searchTerm = signal('');
  readonly categoryId = signal<string | null>(null);
  readonly promoSlug = signal<string | null>(null);
  readonly activePromo = signal<Promotion | null>(null);

  sortBy: 'name' | 'price' | 'createdAt' = 'createdAt';

  readonly activePromoBanner = computed(() => {
    const slug = this.promoSlug();
    const promo = this.activePromo();
    if (promo) {
      return {
        slug: promo.slug,
        tag: promo.tag,
        title: promo.title,
        subtitle: promo.subtitle,
        highlight: promo.highlight,
        highlightLabel: promo.highlightLabel,
        backgroundClass: promo.backgroundClass
      } satisfies PromotionBanner;
    }
    if (!slug) return null;
    return this.bannerSlides().find((b) => b.slug === slug) ?? null;
  });

  readonly filteredProducts = computed(() => {
    let items = this.products();
    const term = this.searchTerm().trim().toLowerCase();
    const catId = this.categoryId();

    if (catId) {
      items = items.filter((p) => p.category.id === catId);
    }

    if (term) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.shortDescription?.toLowerCase().includes(term) ||
          p.category.name.toLowerCase().includes(term)
      );
    }

    return items;
  });

  readonly dealProducts = computed(() =>
    this.products().filter((p) => hasDiscount(p)).slice(0, 8)
  );

  readonly hasActiveFilters = computed(
    () => !!this.searchTerm().trim() || !!this.categoryId() || !!this.promoSlug()
  );

  readonly activeCategoryName = computed(() => {
    const id = this.categoryId();
    if (!id) return null;
    return this.categories().find((c) => c.id === id)?.name ?? null;
  });

  ngOnInit(): void {
    this.promotionsService
      .listBanners()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (banners) => this.bannerSlides.set(banners)
      });

    this.catalog
      .listCategories(true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.categories.set(items)
      });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.searchTerm.set(params.get('q') ?? '');
      this.categoryId.set(params.get('category'));
      this.promoSlug.set(params.get('promo'));
      this.loadProducts();
    });
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'name' | 'price' | 'createdAt';
    this.sortBy = value;
    this.loadProducts();
  }

  goToPromo(slug: string): void {
    void this.router.navigate(['/'], {
      queryParams: { promo: slug, q: null, category: null }
    });
  }

  clearFilters(): void {
    void this.router.navigate(['/']);
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.activePromo.set(null);

    const slug = this.promoSlug();
    const sortDirection =
      this.sortBy === 'price' ? 'asc' : this.sortBy === 'name' ? 'asc' : 'desc';

    if (slug) {
      this.promotionsService
        .getBySlug(slug)
        .pipe(
          catchError(() => of(null)),
          switchMap((promo) => {
            this.activePromo.set(promo);
            return this.promotionsService.listProducts(slug, {
              pageSize: 48,
              sortBy: this.sortBy,
              sortDirection
            });
          }),
          finalize(() => this.loading.set(false)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: (result) => this.products.set(result.items),
          error: (err) => this.error.set(this.apiError.getMessage(err))
        });
      return;
    }

    this.catalog
      .listProducts({
        pageSize: 48,
        categoryId: this.categoryId() ?? undefined,
        sortBy: this.sortBy,
        sortDirection
      })
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
