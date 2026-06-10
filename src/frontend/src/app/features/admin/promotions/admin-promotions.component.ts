import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucidePencil, LucidePlus } from '@lucide/angular';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { PROMOTION_FILTER_OPTIONS, Promotion } from '../../../core/models/promotion.models';
import { PromotionsService } from '../../../core/services/promotions.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { TableComponent } from '../../../shared/ui/table/table.component';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [
    RouterLink,
    ButtonComponent,
    BadgeComponent,
    TableComponent,
    LucidePlus,
    LucidePencil
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="font-display text-2xl font-semibold text-ink">Promoções</h1>
          <p class="mt-1 text-sm text-ink-muted">
            Banners do carrossel com produtos atualizados automaticamente por regras.
          </p>
        </div>
        <a routerLink="/admin/promotions/new">
          <ui-button variant="primary">
            <svg lucidePlus [size]="16"></svg>
            Nova promoção
          </ui-button>
        </a>
      </div>

      @if (loading()) {
        <div class="h-64 animate-pulse rounded-xl bg-surface-muted"></div>
      } @else if (error()) {
        <p class="text-danger">{{ error() }}</p>
      } @else {
        <ui-table>
          <thead tableHeader>
            <tr>
              <th>Banner</th>
              <th class="col-hide-sm">Slug / Link</th>
              <th>Regra de produtos</th>
              <th class="col-hide-sm">Ordem</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody tableBody>
            @for (promo of promotions(); track promo.id) {
              <tr>
                <td>
                  <p class="font-medium">{{ promo.title }}</p>
                  <p class="text-xs text-ink-muted">{{ promo.tag }}</p>
                </td>
                <td class="col-hide-sm font-mono text-xs text-ink-muted">/?promo={{ promo.slug }}</td>
                <td class="text-sm">{{ filterLabel(promo.filterType) }}</td>
                <td class="col-hide-sm">{{ promo.displayOrder }}</td>
                <td>
                  <ui-badge [variant]="promo.isActive ? 'brand' : 'muted'">
                    {{ promo.isActive ? 'Ativa' : 'Inativa' }}
                  </ui-badge>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <a
                      [routerLink]="['/admin/promotions', promo.id, 'edit']"
                      class="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                    >
                      <svg lucidePencil [size]="14"></svg>
                      Editar
                    </a>
                    <button
                      type="button"
                      class="text-xs text-ink-muted hover:text-ink"
                      (click)="toggleStatus(promo)"
                    >
                      {{ promo.isActive ? 'Desativar' : 'Ativar' }}
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="py-10 text-center text-ink-muted">
                  Nenhuma promoção cadastrada.
                </td>
              </tr>
            }
          </tbody>
        </ui-table>
      }
    </div>
  `
})
export class AdminPromotionsComponent implements OnInit {
  private readonly promotionsService = inject(PromotionsService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly promotions = signal<Promotion[]>([]);

  ngOnInit(): void {
    this.load();
  }

  filterLabel(type: string): string {
    return PROMOTION_FILTER_OPTIONS.find((o) => o.value === type)?.label ?? type;
  }

  toggleStatus(promo: Promotion): void {
    this.promotionsService
      .setStatus(promo.id, !promo.isActive)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.success(`Promoção ${promo.isActive ? 'desativada' : 'ativada'}.`);
          this.load();
        },
        error: (err) => this.notifications.error(this.apiError.getMessage(err))
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.promotionsService
      .listAdmin()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (items) => this.promotions.set(items),
        error: (err) => this.error.set(this.apiError.getMessage(err))
      });
  }
}
