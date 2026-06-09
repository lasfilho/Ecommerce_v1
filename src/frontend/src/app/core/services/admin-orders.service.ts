import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../config/api.config';
import { ApiHttpService } from '../http/api-http.service';
import { PagedResult } from '../models/catalog.models';
import {
  AdminOrderSummary,
  OrderDetail,
  OrderStatus,
  orderStatusToApi
} from '../models/order.models';

@Injectable({ providedIn: 'root' })
export class AdminOrdersService {
  private readonly api = inject(ApiHttpService);

  listOrders(
    page = 1,
    pageSize = 20,
    status?: OrderStatus
  ): Observable<PagedResult<AdminOrderSummary>> {
    const params: Record<string, string | number> = { page, pageSize };
    if (status != null) params['status'] = orderStatusToApi(status);

    return this.api.get<PagedResult<AdminOrderSummary>>(ApiEndpoints.admin.orders, { params });
  }

  getOrder(id: string): Observable<OrderDetail> {
    return this.api.get<OrderDetail>(`${ApiEndpoints.orders}/${id}`);
  }

  updateStatus(id: string, status: OrderStatus): Observable<OrderDetail> {
    return this.api.patch<OrderDetail>(`${ApiEndpoints.orders}/${id}/status`, {
      status: orderStatusToApi(status)
    });
  }
}
