import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideSave } from '@lucide/angular';
import { finalize, forkJoin } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { Category } from '../../../core/models/admin.models';
import { ProductListItem } from '../../../core/models/catalog.models';
import { findExactExcelPaletteColor } from '../../../core/models/excel-color-palette';
import {
  PROMOTION_DEFAULT_BANNER_COLOR,
  PROMOTION_FILTER_OPTIONS,
  promotionBannerBackground,
  promotionBannerClass,
  PromotionFilterType
} from '../../../core/models/promotion.models';
import { AdminCatalogService } from '../../../core/services/admin-catalog.service';
import { PromotionsService } from '../../../core/services/promotions.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ColorPickerComponent } from '../../../shared/ui/color-picker/color-picker.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';

@Component({
  selector: 'app-admin-promotion-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CardComponent,
    ButtonComponent,
    InputComponent,
    ColorPickerComponent,
    SelectComponent,
    TextareaComponent,
    LucideArrowLeft,
    LucideSave
  ],
  template: `
    <div class="mx-auto max-w-3xl space-y-6">
      <a
        routerLink="/admin/promotions"
        class="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-brand"
      >
        <svg lucideArrowLeft [size]="16"></svg>
        Voltar às promoções
      </a>

      <div>
        <h1 class="font-display text-2xl font-semibold text-ink">
          {{ isEdit() ? 'Editar promoção' : 'Nova promoção' }}
        </h1>
        <p class="mt-1 text-sm text-ink-muted">
          O banner aparece no carrossel. Os produtos da página são definidos pela regra abaixo —
          sem precisar atualizar manualmente.
        </p>
      </div>

      @if (loading()) {
        <div class="h-96 animate-pulse rounded-xl bg-surface-muted"></div>
      } @else {
        <ui-card padding="lg">
          <form class="flex flex-col gap-6" [formGroup]="form" (ngSubmit)="submit()">
            <div class="rounded-lg border border-brand/20 bg-brand-soft/40 p-4 text-sm text-ink-muted">
              <p class="font-semibold text-ink">Como funciona o link automático</p>
              <p class="mt-1">
                Ao clicar no banner, o cliente vai para
                <code class="rounded bg-surface-elevated px-1">/?promo=seu-slug</code>. A API
                aplica a regra escolhida e lista os produtos elegíveis — inclusive novos itens
                adicionados depois.
              </p>
            </div>

            @if (!isEdit()) {
              <ui-input
                label="Slug (URL da promoção)"
                formControlName="slug"
                placeholder="dia-das-maes"
                [required]="true"
                [error]="fieldError('slug') ?? undefined"
              />
            }

            <div class="grid gap-4 sm:grid-cols-2">
              <ui-input label="Etiqueta" formControlName="tag" [required]="true" />
              <ui-input
                label="Ordem no carrossel"
                type="number"
                formControlName="displayOrder"
                [min]="0"
              />
            </div>

            <ui-input label="Título do banner" formControlName="title" [required]="true" />
            <ui-textarea label="Subtítulo" formControlName="subtitle" [rows]="2" [required]="true" />

            <div class="grid gap-4 sm:grid-cols-2">
              <ui-input label="Destaque (opcional)" formControlName="highlight" placeholder="50%" />
              <ui-input
                label="Rótulo do destaque"
                formControlName="highlightLabel"
                placeholder="de desconto"
              />
            </div>

            <ui-color-picker
              label="Cor do banner"
              formControlName="backgroundClass"
              [required]="true"
            />

            <div class="flex flex-col gap-1.5">
              <p class="text-sm font-medium text-ink">Prévia do banner</p>
              <div class="overflow-hidden rounded-xl border border-border shadow-sm">
                <div
                  class="relative flex min-h-[5.5rem] flex-col justify-center px-5 py-4 text-white"
                  [class]="bannerClass(form.getRawValue().backgroundClass) ?? ''"
                  [style.background-color]="bannerBackground(form.getRawValue().backgroundClass)"
                >
                  @if (form.getRawValue().tag) {
                    <span
                      class="mb-1.5 w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    >
                      {{ form.getRawValue().tag }}
                    </span>
                  }
                  <p class="font-display text-lg font-bold leading-tight">
                    {{ form.getRawValue().title || 'Título do banner' }}
                  </p>
                  <p class="mt-0.5 text-sm text-white/90">
                    {{ form.getRawValue().subtitle || 'Subtítulo do banner' }}
                  </p>
                  @if (form.getRawValue().highlight) {
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-right">
                      <span class="block text-2xl font-black leading-none">
                        {{ form.getRawValue().highlight }}
                      </span>
                      @if (form.getRawValue().highlightLabel) {
                        <span class="text-xs font-medium text-white/80">
                          {{ form.getRawValue().highlightLabel }}
                        </span>
                      }
                    </span>
                  }
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <ui-select
                label="Regra de produtos (atualização automática)"
                formControlName="filterType"
                [options]="filterTypeOptions"
                [required]="true"
              />
              @if (selectedFilterHint()) {
                <p class="text-sm text-ink-muted">{{ selectedFilterHint() }}</p>
              }
            </div>

            @if (form.getRawValue().filterType === 'Category') {
              <ui-select
                label="Categoria"
                formControlName="categoryId"
                [options]="categoryOptions()"
                placeholder="Selecione a categoria..."
                [required]="true"
              />
            }

            @if (form.getRawValue().filterType === 'MinPrice') {
              <ui-input
                label="Preço mínimo (R$)"
                type="number"
                formControlName="minPrice"
                [min]="0"
                [required]="true"
              />
            }

            @if (form.getRawValue().filterType === 'Keywords') {
              <ui-input
                label="Palavras-chave (separadas por vírgula)"
                formControlName="keywords"
                placeholder="presente, mãe, fone, bluetooth"
                [required]="true"
              />
            }

            @if (form.getRawValue().filterType === 'ProductIds') {
              <div class="flex flex-col gap-1.5">
                <p class="text-sm font-medium text-ink">Produtos da campanha</p>
                <div class="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                  @for (product of products(); track product.id) {
                    <label class="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        [checked]="selectedProductIds().has(product.id)"
                        (change)="toggleProduct(product.id, $event)"
                      />
                      <span>{{ product.name }}</span>
                      <span class="text-xs text-ink-faint">({{ product.sku }})</span>
                    </label>
                  }
                </div>
              </div>
            }

            <div class="grid gap-4 sm:grid-cols-2">
              <ui-input label="Início (opcional)" type="datetime-local" formControlName="startsAt" />
              <ui-input label="Fim (opcional)" type="datetime-local" formControlName="endsAt" />
            </div>

            @if (errorMessage()) {
              <p class="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                {{ errorMessage() }}
              </p>
            }

            <ui-button type="submit" variant="primary" [loading]="submitting()">
              <svg lucideSave [size]="16"></svg>
              {{ isEdit() ? 'Salvar alterações' : 'Criar promoção' }}
            </ui-button>
          </form>
        </ui-card>
      }
    </div>
  `
})
export class AdminPromotionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly promotionsService = inject(PromotionsService);
  private readonly catalog = inject(AdminCatalogService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly products = signal<ProductListItem[]>([]);
  readonly selectedProductIds = signal<Set<string>>(new Set());

  readonly filterTypeOptions = PROMOTION_FILTER_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label
  }));

  readonly bannerBackground = promotionBannerBackground;
  readonly bannerClass = promotionBannerClass;

  readonly categoryOptions = computed(() =>
    this.categories().map((c) => ({ value: c.id, label: c.name }))
  );

  readonly selectedFilterHint = computed(() => {
    const type = this.form.getRawValue().filterType as PromotionFilterType;
    return PROMOTION_FILTER_OPTIONS.find((o) => o.value === type)?.hint ?? null;
  });

  private promotionId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    slug: ['', [Validators.required, Validators.maxLength(120)]],
    tag: ['', Validators.required],
    title: ['', Validators.required],
    subtitle: ['', Validators.required],
    highlight: [''],
    highlightLabel: [''],
    backgroundClass: [PROMOTION_DEFAULT_BANNER_COLOR, Validators.required],
    filterType: ['HasDiscount' as PromotionFilterType, Validators.required],
    categoryId: [''],
    minPrice: [null as number | null],
    keywords: [''],
    displayOrder: [0, Validators.required],
    startsAt: [''],
    endsAt: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit.set(!!id);
    this.promotionId = id;

    if (this.isEdit()) {
      this.form.controls.slug.disable();
    }

    if (id) {
      forkJoin({
        categories: this.catalog.listCategories(),
        products: this.catalog.listProducts({ pageSize: 100, sortBy: 'name', sortDirection: 'asc' }),
        promotion: this.promotionsService.listAdmin()
      })
        .pipe(
          finalize(() => this.loading.set(false)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: ({ categories, products, promotion }) => {
            this.categories.set(categories);
            this.products.set(products.items);
            const item = promotion.find((p) => p.id === id);
            if (!item) {
              this.errorMessage.set('Promoção não encontrada.');
              return;
            }
            this.patchForm(item);
          },
          error: (err) => this.errorMessage.set(this.apiError.getMessage(err))
        });
    } else {
      forkJoin({
        categories: this.catalog.listCategories(),
        products: this.catalog.listProducts({ pageSize: 100, sortBy: 'name', sortDirection: 'asc' })
      })
        .pipe(
          finalize(() => this.loading.set(false)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: ({ categories, products }) => {
            this.categories.set(categories);
            this.products.set(products.items);
          },
          error: (err) => this.errorMessage.set(this.apiError.getMessage(err))
        });
    }
  }

  toggleProduct(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedProductIds.update((set) => {
      const next = new Set(set);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  fieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.touched || !control.invalid) return null;
    if (control.hasError('required')) return 'Campo obrigatório.';
    return 'Valor inválido.';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      slug: raw.slug,
      tag: raw.tag,
      title: raw.title,
      subtitle: raw.subtitle,
      highlight: raw.highlight || undefined,
      highlightLabel: raw.highlightLabel || undefined,
      backgroundClass: raw.backgroundClass,
      filterType: raw.filterType,
      categoryId: raw.filterType === 'Category' ? raw.categoryId || null : null,
      minPrice: raw.filterType === 'MinPrice' ? Number(raw.minPrice) : null,
      keywords: raw.filterType === 'Keywords' ? raw.keywords : undefined,
      productIds:
        raw.filterType === 'ProductIds' ? Array.from(this.selectedProductIds()) : [],
      displayOrder: Number(raw.displayOrder),
      startsAt: raw.startsAt ? new Date(raw.startsAt).toISOString() : null,
      endsAt: raw.endsAt ? new Date(raw.endsAt).toISOString() : null
    };

    this.submitting.set(true);
    this.errorMessage.set(null);

    const request$ = this.isEdit() && this.promotionId
      ? this.promotionsService.update(this.promotionId, payload)
      : this.promotionsService.create(payload);

    request$
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notifications.success(
            this.isEdit() ? 'Promoção atualizada.' : 'Promoção criada com sucesso.'
          );
          void this.router.navigate(['/admin/promotions']);
        },
        error: (err) => this.errorMessage.set(this.apiError.getMessage(err))
      });
  }

  private patchForm(item: {
    slug: string;
    tag: string;
    title: string;
    subtitle: string;
    highlight?: string | null;
    highlightLabel?: string | null;
    backgroundClass: string;
    filterType: PromotionFilterType;
    categoryId?: string | null;
    minPrice?: number | null;
    keywords?: string | null;
    productIds: string[];
    displayOrder: number;
    startsAt?: string | null;
    endsAt?: string | null;
  }): void {
    this.form.patchValue({
      slug: item.slug,
      tag: item.tag,
      title: item.title,
      subtitle: item.subtitle,
      highlight: item.highlight ?? '',
      highlightLabel: item.highlightLabel ?? '',
      backgroundClass: this.resolveEditableColor(item.backgroundClass),
      filterType: item.filterType,
      categoryId: item.categoryId ?? '',
      minPrice: item.minPrice ?? null,
      keywords: item.keywords ?? '',
      displayOrder: item.displayOrder,
      startsAt: item.startsAt ? this.toLocalInput(item.startsAt) : '',
      endsAt: item.endsAt ? this.toLocalInput(item.endsAt) : ''
    });
    this.selectedProductIds.set(new Set(item.productIds));
  }

  /** Preserva a cor salva; normaliza para swatch exato da paleta quando existir. */
  private resolveEditableColor(backgroundClass: string): string {
    return findExactExcelPaletteColor(backgroundClass) ?? backgroundClass;
  }

  private toLocalInput(iso: string): string {
    const date = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
