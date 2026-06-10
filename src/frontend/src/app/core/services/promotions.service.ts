import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../config/api.config';
import { ApiHttpService } from '../http/api-http.service';
import {
  Promotion,
  PromotionBanner,
  PromotionFormValue,
  PromotionProductsResult
} from '../models/promotion.models';

@Injectable({ providedIn: 'root' })
export class PromotionsService {
  private readonly api = inject(ApiHttpService);

  listBanners(): Observable<PromotionBanner[]> {
    return this.api.get<PromotionBanner[]>(ApiEndpoints.promotions.banners);
  }

  listAdmin(isActive?: boolean): Observable<Promotion[]> {
    const params: Record<string, boolean> = {};
    if (isActive != null) {
      params['isActive'] = isActive;
    }
    return this.api.get<Promotion[]>(ApiEndpoints.promotions.base, { params });
  }

  getBySlug(slug: string): Observable<Promotion> {
    return this.api.get<Promotion>(`${ApiEndpoints.promotions.base}/${slug}`);
  }

  listProducts(
    slug: string,
    options: { page?: number; pageSize?: number; sortBy?: string; sortDirection?: string } = {}
  ): Observable<PromotionProductsResult> {
    return this.api.get<PromotionProductsResult>(
      `${ApiEndpoints.promotions.base}/${slug}/products`,
      {
        params: {
          page: options.page ?? 1,
          pageSize: options.pageSize ?? 48,
          sortBy: options.sortBy ?? 'createdAt',
          sortDirection: options.sortDirection ?? 'desc'
        }
      }
    );
  }

  create(payload: PromotionFormValue): Observable<Promotion> {
    return this.api.post<Promotion>(ApiEndpoints.promotions.base, payload);
  }

  update(id: string, payload: Omit<PromotionFormValue, 'slug'>): Observable<Promotion> {
    return this.api.put<Promotion>(`${ApiEndpoints.promotions.base}/${id}`, payload);
  }

  setStatus(id: string, isActive: boolean): Observable<Promotion> {
    return this.api.patch<Promotion>(`${ApiEndpoints.promotions.base}/${id}/status`, { isActive });
  }
}
