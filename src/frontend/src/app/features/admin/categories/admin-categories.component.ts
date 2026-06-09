import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucidePlus } from '@lucide/angular';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { Category } from '../../../core/models/admin.models';
import { AdminCatalogService } from '../../../core/services/admin-catalog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    InputComponent,
    TextareaComponent,
    BadgeComponent,
    TableComponent,
    LucidePlus
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="font-display text-2xl font-semibold text-ink">Categorias</h1>
        <p class="mt-1 text-sm text-ink-muted">Organize o catálogo em categorias.</p>
      </div>

      <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
        <ui-card padding="lg">
          <h2 class="font-display text-lg font-semibold text-ink">
            {{ editingId() ? 'Editar categoria' : 'Nova categoria' }}
          </h2>
          <form class="mt-4 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
            <ui-input label="Nome" formControlName="name" [required]="true" />
            <ui-input label="Slug (opcional)" formControlName="slug" />
            <ui-textarea label="Descrição" formControlName="description" [rows]="3" />
            @if (formError()) {
              <p class="text-sm text-danger">{{ formError() }}</p>
            }
            <div class="flex gap-2">
              <ui-button type="submit" variant="primary" [loading]="submitting()">
                <svg lucidePlus [size]="16"></svg>
                {{ editingId() ? 'Salvar' : 'Criar' }}
              </ui-button>
              @if (editingId()) {
                <ui-button type="button" variant="ghost" (clicked)="cancelEdit()"
                  >Cancelar</ui-button
                >
              }
            </div>
          </form>
        </ui-card>

        <div>
          @if (loading()) {
            <div class="h-64 animate-pulse rounded-xl bg-surface-muted"></div>
          } @else {
            <ui-table>
              <thead tableHeader>
                <tr>
                  <th>Nome</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody tableBody>
                @for (category of categories(); track category.id) {
                  <tr>
                    <td class="font-medium">{{ category.name }}</td>
                    <td class="text-ink-muted">{{ category.slug }}</td>
                    <td>
                      <ui-badge [variant]="category.isActive ? 'brand' : 'muted'">
                        {{ category.isActive ? 'Ativa' : 'Inativa' }}
                      </ui-badge>
                    </td>
                    <td>
                      <div class="flex gap-2">
                        <button
                          type="button"
                          class="text-sm text-brand hover:underline"
                          (click)="edit(category)"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          class="text-sm text-ink-muted hover:text-ink"
                          (click)="toggleStatus(category)"
                        >
                          {{ category.isActive ? 'Desativar' : 'Ativar' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="py-10 text-center text-ink-muted">
                      Nenhuma categoria cadastrada.
                    </td>
                  </tr>
                }
              </tbody>
            </ui-table>
          }
        </div>
      </div>
    </div>
  `
})
export class AdminCategoriesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(AdminCatalogService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly editingId = signal<string | null>(null);
  readonly formError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    slug: [''],
    description: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  edit(category: Category): void {
    this.editingId.set(category.id);
    this.form.patchValue({
      name: category.name,
      slug: category.slug,
      description: category.description ?? ''
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset();
    this.formError.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.form.value.name!,
      slug: this.form.value.slug || null,
      description: this.form.value.description || null,
      parentCategoryId: null
    };

    this.submitting.set(true);
    this.formError.set(null);

    const request$ = this.editingId()
      ? this.catalog.updateCategory(this.editingId()!, payload)
      : this.catalog.createCategory(payload);

    request$
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notifications.success(
            this.editingId() ? 'Categoria atualizada.' : 'Categoria criada.'
          );
          this.cancelEdit();
          this.load();
        },
        error: (err) => this.formError.set(this.apiError.getMessage(err))
      });
  }

  toggleStatus(category: Category): void {
    this.catalog
      .setCategoryStatus(category.id, !category.isActive)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.success('Status atualizado.');
          this.load();
        },
        error: (err) => this.notifications.error(this.apiError.getMessage(err))
      });
  }

  private load(): void {
    this.loading.set(true);
    this.catalog
      .listCategories()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (items) => this.categories.set(items),
        error: (err) => this.notifications.error(this.apiError.getMessage(err))
      });
  }
}
