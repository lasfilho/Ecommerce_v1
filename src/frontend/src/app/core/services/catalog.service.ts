import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../config/api.config';
import { ApiHttpService } from '../http/api-http.service';
import {
  PagedResult,
  ProductDetail,
  ProductFilters,
  ProductListItem
} from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly api = inject(ApiHttpService);

  listProducts(filters: ProductFilters = {}): Observable<PagedResult<ProductListItem>> {
    const params: Record<string, string | number> = {
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 12,
      sortBy: filters.sortBy ?? 'createdAt',
      sortDirection: filters.sortDirection ?? 'desc'
    };

    if (filters.categoryId) {
      params['categoryId'] = filters.categoryId;
    }
    if (filters.minPrice != null) {
      params['minPrice'] = filters.minPrice;
    }
    if (filters.maxPrice != null) {
      params['maxPrice'] = filters.maxPrice;
    }

    return this.api.get<PagedResult<ProductListItem>>(ApiEndpoints.products, { params });
  }

  getProductById(id: string): Observable<ProductDetail> {
    return this.api.get<ProductDetail>(`${ApiEndpoints.products}/${id}`);
  }
}
