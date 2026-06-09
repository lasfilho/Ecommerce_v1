import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import {
  OrderDetail,
  orderStatusLabel,
  OrderStatus,
  ORDER_STATUS_OPTIONS
} from '../../../core/models/order.models';
import { AdminOrdersService } from '../../../core/services/admin-orders.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    DatePipe,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SelectComponent,
    CurrencyBrlPipe,
    LucideArrowLeft
  ],
  template: `
    <div class="mx-auto max-w-4xl space-y-6">
      <a
        routerLink="/admin/orders"
        class="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-brand"
      >
        <svg lucideArrowLeft [size]="16"></svg>
        Voltar aos pedidos
      </a>

      @if (loading()) {
        <div class="h-80 animate-pulse rounded-xl bg-surface-muted"></div>
      } @else if (error()) {
        <ui-card
          ><p class="text-danger">{{ error() }}</p></ui-card
        >
      } @else {
        @if (order(); as item) {
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 class="font-display text-2xl font-semibold text-ink">
                Pedido {{ item.orderNumber }}
              </h1>
              <p class="mt-1 text-sm text-ink-muted">
                Criado em {{ item.createdAt | date: 'dd/MM/yyyy HH:mm' }}
              </p>
            </div>
            <ui-badge variant="brand">{{ statusLabel(item.status) }}</ui-badge>
          </div>

          <div class="grid gap-6 lg:grid-cols-[1fr_280px]">
            <ui-card padding="lg">
              <h2 class="font-display text-lg font-semibold text-ink">Itens</h2>
              <div class="mt-4 space-y-4">
                @for (line of item.items; track line.id) {
                  <div
                    class="flex items-center justify-between border-b border-border pb-3 last:border-0"
                  >
                    <div>
                      <p class="font-medium text-ink">{{ line.productName }}</p>
                      <p class="text-xs text-ink-faint">
                        SKU {{ line.sku }} · Qtd {{ line.quantity }}
                      </p>
                    </div>
                    <p class="font-semibold text-ink">{{ line.lineTotal | currencyBrl }}</p>
                  </div>
                }
              </div>
            </ui-card>

            <div class="space-y-4">
              <ui-card padding="lg">
                <h2 class="font-display text-lg font-semibold text-ink">Resumo</h2>
                <div class="mt-4 space-y-2 text-sm">
                  <div class="flex justify-between text-ink-muted">
                    <span>Subtotal</span>
                    <span>{{ item.subtotal | currencyBrl }}</span>
                  </div>
                  <div class="flex justify-between text-ink-muted">
                    <span>Frete</span>
                    <span>{{ item.shippingCost | currencyBrl }}</span>
                  </div>
                  <div
                    class="flex justify-between border-t border-border pt-2 font-semibold text-ink"
                  >
                    <span>Total</span>
                    <span>{{ item.total | currencyBrl }}</span>
                  </div>
                </div>
              </ui-card>

              <ui-card padding="lg">
                <h2 class="font-display text-lg font-semibold text-ink">Atualizar status</h2>
                <div class="mt-4 space-y-3">
                  <ui-select
                    label="Novo status"
                    [options]="statusOptions"
                    [(ngModel)]="selectedStatus"
                  />
                  <ui-button
                    variant="primary"
                    [fullWidth]="true"
                    [loading]="updating()"
                    (clicked)="updateStatus()"
                  >
                    Atualizar
                  </ui-button>
                </div>
              </ui-card>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class AdminOrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersService = inject(AdminOrdersService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly updating = signal(false);
  readonly error = signal<string | null>(null);
  readonly order = signal<OrderDetail | null>(null);

  readonly statusOptions = ORDER_STATUS_OPTIONS;
  readonly statusLabel = orderStatusLabel;

  selectedStatus = 'Pending';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Pedido inválido.');
      this.loading.set(false);
      return;
    }

    this.ordersService
      .getOrder(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (order) => {
          this.order.set(order);
          this.selectedStatus = this.normalizeStatus(order.status);
        },
        error: (err) => this.error.set(this.apiError.getMessage(err))
      });
  }

  updateStatus(): void {
    const item = this.order();
    if (!item) return;

    this.updating.set(true);
    this.ordersService
      .updateStatus(item.id, this.selectedStatus as OrderStatus)
      .pipe(
        finalize(() => this.updating.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (updated) => {
          this.order.set(updated);
          this.selectedStatus = this.normalizeStatus(updated.status);
          this.notifications.success('Status do pedido atualizado.');
        },
        error: (err) => this.notifications.error(this.apiError.getMessage(err))
      });
  }

  private normalizeStatus(status: OrderStatus): string {
    const map: Record<string, string> = {
      '0': 'Pending',
      '1': 'Paid',
      '2': 'Processing',
      '3': 'Shipped',
      '4': 'Delivered',
      '5': 'Cancelled'
    };
    return map[String(status)] ?? String(status);
  }
}
