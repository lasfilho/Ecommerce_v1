import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../config/api.config';
import { ApiHttpService } from '../http/api-http.service';
import {
  Category,
  CreateCategoryRequest,
  CreateProductRequest,
  UpdateCategoryRequest,
  UpdateProductRequest
} from '../models/admin.models';
import {
  PagedResult,
  ProductDetail,
  ProductFilters,
  ProductListItem
} from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class AdminCatalogService {
  private readonly api = inject(ApiHttpService);

  listProducts(filters: ProductFilters = {}): Observable<PagedResult<ProductListItem>> {
    const params: Record<string, string | number | boolean> = {
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
      sortBy: filters.sortBy ?? 'createdAt',
      sortDirection: filters.sortDirection ?? 'desc'
    };

    if (filters.categoryId) params['categoryId'] = filters.categoryId;
    if (filters.isActive != null) params['isActive'] = filters.isActive;

    return this.api.get<PagedResult<ProductListItem>>(ApiEndpoints.products, { params });
  }

  getProduct(id: string): Observable<ProductDetail> {
    return this.api.get<ProductDetail>(`${ApiEndpoints.products}/${id}`);
  }

  createProduct(request: CreateProductRequest): Observable<ProductDetail> {
    return this.api.post<ProductDetail>(ApiEndpoints.products, request);
  }

  updateProduct(id: string, request: UpdateProductRequest): Observable<ProductDetail> {
    return this.api.put<ProductDetail>(`${ApiEndpoints.products}/${id}`, request);
  }

  setProductStatus(id: string, isActive: boolean): Observable<ProductDetail> {
    return this.api.patch<ProductDetail>(`${ApiEndpoints.products}/${id}/status`, { isActive });
  }

  listCategories(isActive?: boolean): Observable<Category[]> {
    const params = isActive != null ? { isActive } : undefined;
    return this.api.get<Category[]>(ApiEndpoints.categories, { params });
  }

  createCategory(request: CreateCategoryRequest): Observable<Category> {
    return this.api.post<Category>(ApiEndpoints.categories, request);
  }

  updateCategory(id: string, request: UpdateCategoryRequest): Observable<Category> {
    return this.api.put<Category>(`${ApiEndpoints.categories}/${id}`, request);
  }

  setCategoryStatus(id: string, isActive: boolean): Observable<Category> {
    return this.api.patch<Category>(`${ApiEndpoints.categories}/${id}/status`, { isActive });
  }
}
