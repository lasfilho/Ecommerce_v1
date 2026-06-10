import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import {
  AdminOrderSummary,
  orderStatusLabel,
  OrderStatus,
  ORDER_STATUS_OPTIONS
} from '../../../core/models/order.models';
import { AdminOrdersService } from '../../../core/services/admin-orders.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { TableComponent } from '../../../shared/ui/table/table.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [RouterLink, DatePipe, BadgeComponent, TableComponent, CurrencyBrlPipe],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="font-display text-2xl font-semibold text-ink">Pedidos</h1>
        <p class="mt-1 text-sm text-ink-muted">Acompanhe e atualize o status dos pedidos.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          [class.bg-brand-soft]="!statusFilter()"
          [class.text-brand]="!statusFilter()"
          [class.text-ink-muted]="statusFilter()"
          (click)="setStatusFilter(undefined)"
        >
          Todos
        </button>
        @for (option of statusOptions; track option.value) {
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            [class.bg-brand-soft]="statusFilter() === option.value"
            [class.text-brand]="statusFilter() === option.value"
            [class.text-ink-muted]="statusFilter() !== option.value"
            (click)="setStatusFilter(option.value)"
          >
            {{ option.label }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="h-64 animate-pulse rounded-xl bg-surface-muted"></div>
      } @else if (error()) {
        <p class="text-danger">{{ error() }}</p>
      } @else {
        <ui-table>
          <thead tableHeader>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Total</th>
              <th class="col-hide-sm">Itens</th>
              <th>Status</th>
              <th class="col-hide-md">Data</th>
              <th></th>
            </tr>
          </thead>
          <tbody tableBody>
            @for (order of orders(); track order.id) {
              <tr>
                <td class="font-medium">{{ order.orderNumber }}</td>
                <td>
                  <p>{{ order.customerName }}</p>
                  <p class="text-xs text-ink-muted">{{ order.customerEmail }}</p>
                </td>
                <td>{{ order.total | currencyBrl }}</td>
                <td class="col-hide-sm">{{ order.itemCount }}</td>
                <td>
                  <ui-badge [variant]="statusVariant(order.status)">
                    {{ statusLabel(order.status) }}
                  </ui-badge>
                </td>
                <td class="col-hide-md text-ink-muted">{{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <a
                    [routerLink]="['/admin/orders', order.id]"
                    class="text-sm font-medium text-brand hover:underline"
                  >
                    Detalhes
                  </a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="py-10 text-center text-ink-muted">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            }
          </tbody>
        </ui-table>
      }
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  private readonly ordersService = inject(AdminOrdersService);
  private readonly apiError = inject(ApiErrorService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly orders = signal<AdminOrderSummary[]>([]);
  readonly statusFilter = signal<string | undefined>(undefined);

  readonly statusOptions = ORDER_STATUS_OPTIONS;
  readonly statusLabel = orderStatusLabel;

  ngOnInit(): void {
    this.load();
  }

  setStatusFilter(status?: string): void {
    this.statusFilter.set(status);
    this.load();
  }

  statusVariant(status: OrderStatus): 'brand' | 'accent' | 'danger' | 'muted' {
    const label = String(status);
    if (label === 'Cancelled' || label === '5') return 'danger';
    if (label === 'Delivered' || label === '4') return 'brand';
    if (label === 'Pending' || label === '0') return 'accent';
    return 'muted';
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.ordersService
      .listOrders(1, 50, this.statusFilter() as OrderStatus | undefined)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (result) => this.orders.set(result.items),
        error: (err) => this.error.set(this.apiError.getMessage(err))
      });
  }
}
