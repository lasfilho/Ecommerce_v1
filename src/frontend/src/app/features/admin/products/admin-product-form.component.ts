import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideSave } from '@lucide/angular';
import { finalize, forkJoin, of, switchMap } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { Category } from '../../../core/models/admin.models';
import { AdminCatalogService } from '../../../core/services/admin-catalog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CardComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    LucideArrowLeft,
    LucideSave
  ],
  template: `
    <div class="mx-auto max-w-3xl space-y-6">
      <a
        routerLink="/admin/products"
        class="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-brand"
      >
        <svg lucideArrowLeft [size]="16"></svg>
        Voltar aos produtos
      </a>

      <div>
        <h1 class="font-display text-2xl font-semibold text-ink">
          {{ isEdit() ? 'Editar produto' : 'Novo produto' }}
        </h1>
        <p class="mt-1 text-sm text-ink-muted">Preencha os dados do catálogo e estoque.</p>
      </div>

      @if (loading()) {
        <div class="h-96 animate-pulse rounded-xl bg-surface-muted"></div>
      } @else {
        <ui-card padding="lg">
          <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">
            <ui-select
              label="Categoria"
              formControlName="categoryId"
              [options]="categoryOptions()"
              placeholder="Selecione..."
              [required]="true"
              [error]="fieldError('categoryId')"
            />

            <div class="grid gap-4 sm:grid-cols-2">
              <ui-input
                label="Nome"
                formControlName="name"
                [required]="true"
                [error]="fieldError('name')"
              />
              <ui-input
                label="SKU"
                formControlName="sku"
                [required]="true"
                [error]="fieldError('sku')"
              />
            </div>

            <ui-input
              label="Slug (opcional)"
              formControlName="slug"
              placeholder="gerado-automaticamente"
            />

            <ui-textarea label="Descrição curta" formControlName="shortDescription" [rows]="2" />
            <ui-textarea label="Descrição completa" formControlName="longDescription" [rows]="5" />

            <div class="grid gap-4 sm:grid-cols-3">
              <ui-input
                label="Preço"
                type="number"
                formControlName="price"
                [required]="true"
                [min]="0"
                [error]="fieldError('price')"
              />
              <ui-input
                label="Preço promocional"
                type="number"
                formControlName="promotionalPrice"
                [min]="0"
              />
              <ui-input
                label="Estoque"
                type="number"
                formControlName="stockQuantity"
                [required]="true"
                [min]="0"
                [error]="fieldError('stockQuantity')"
              />
            </div>

            <ui-input
              label="URL da imagem principal"
              formControlName="imageUrl"
              placeholder="https://..."
            />

            @if (errorMessage()) {
              <p class="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                {{ errorMessage() }}
              </p>
            }

            <ui-button type="submit" variant="primary" [loading]="submitting()">
              <svg lucideSave [size]="16"></svg>
              {{ isEdit() ? 'Salvar alterações' : 'Criar produto' }}
            </ui-button>
          </form>
        </ui-card>
      }
    </div>
  `
})
export class AdminProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(AdminCatalogService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly isEdit = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly categoryOptions = signal<{ value: string; label: string }[]>([]);

  private productId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    categoryId: ['', Validators.required],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    slug: [''],
    sku: ['', [Validators.required, Validators.maxLength(50)]],
    shortDescription: [''],
    longDescription: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    promotionalPrice: [null as number | null],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    imageUrl: ['']
  });

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');

    const categories$ = this.catalog.listCategories();
    const product$ = this.productId ? this.catalog.getProduct(this.productId) : of(null);

    forkJoin({ categories: categories$, product: product$ })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ categories, product }) => {
          this.categoryOptions.set(
            categories.map((c: Category) => ({ value: c.id, label: c.name }))
          );

          if (product) {
            this.isEdit.set(true);
            this.form.patchValue({
              categoryId: product.category.id,
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              shortDescription: product.shortDescription ?? '',
              longDescription: product.longDescription ?? '',
              price: product.price,
              promotionalPrice: product.promotionalPrice ?? null,
              stockQuantity: product.stockQuantity,
              imageUrl: product.images[0]?.url ?? product.primaryImage?.url ?? ''
            });
          }
        },
        error: (err) => this.errorMessage.set(this.apiError.getMessage(err))
      });
  }

  fieldError(controlName: 'categoryId' | 'name' | 'sku' | 'price' | 'stockQuantity'): string {
    const control = this.form.controls[controlName];
    if (!control.touched || !control.errors) return '';
    if (control.errors['required']) return 'Campo obrigatório.';
    if (control.errors['min']) return 'Valor inválido.';
    return 'Valor inválido.';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      categoryId: raw.categoryId,
      name: raw.name,
      slug: raw.slug || null,
      sku: raw.sku,
      shortDescription: raw.shortDescription || null,
      longDescription: raw.longDescription || null,
      price: Number(raw.price),
      promotionalPrice: raw.promotionalPrice ? Number(raw.promotionalPrice) : null,
      stockQuantity: Number(raw.stockQuantity),
      images: raw.imageUrl
        ? [{ url: raw.imageUrl, altText: raw.name, displayOrder: 0, isPrimary: true }]
        : null
    };

    this.submitting.set(true);
    this.errorMessage.set(null);

    const request$ =
      this.isEdit() && this.productId
        ? this.catalog.updateProduct(this.productId, payload)
        : this.catalog.createProduct(payload);

    request$
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notifications.success(this.isEdit() ? 'Produto atualizado.' : 'Produto criado.');
          void this.router.navigate(['/admin/products']);
        },
        error: (err) => this.errorMessage.set(this.apiError.getMessage(err))
      });
  }
}
