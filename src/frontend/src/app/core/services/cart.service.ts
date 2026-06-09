import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { ApiEndpoints } from '../config/api.config';
import { ApiErrorService } from '../http/api-error.service';
import { ApiHttpService } from '../http/api-http.service';
import { Cart } from '../models/cart.models';
import { NotificationService } from '../../shared/services/notification.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiHttpService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notifications = inject(NotificationService);

  private readonly cartSignal = signal<Cart | null>(null);
  private readonly loadingSignal = signal(false);

  readonly cart = this.cartSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly itemCount = computed(() => this.cartSignal()?.totalItems ?? 0);
  readonly subtotal = computed(() => this.cartSignal()?.subtotal ?? 0);
  readonly isEmpty = computed(() => (this.cartSignal()?.items.length ?? 0) === 0);

  refresh(): Observable<Cart> {
    this.loadingSignal.set(true);

    return this.api.get<Cart>(ApiEndpoints.cart).pipe(
      tap((cart) => this.cartSignal.set(cart)),
      finalize(() => this.loadingSignal.set(false)),
      catchError((error) => this.handleError(error))
    );
  }

  addItem(productId: string, quantity: number): Observable<Cart> {
    return this.api.post<Cart>(`${ApiEndpoints.cart}/items/${productId}`, { quantity }).pipe(
      tap((cart) => {
        this.cartSignal.set(cart);
        this.notifications.success('Produto adicionado ao carrinho.');
      }),
      catchError((error) => this.handleError(error, true))
    );
  }

  updateQuantity(productId: string, quantity: number): Observable<Cart> {
    return this.api.put<Cart>(`${ApiEndpoints.cart}/items/${productId}`, { quantity }).pipe(
      tap((cart) => this.cartSignal.set(cart)),
      catchError((error) => this.handleError(error, true))
    );
  }

  removeItem(productId: string): Observable<Cart> {
    return this.api.delete<Cart>(`${ApiEndpoints.cart}/items/${productId}`).pipe(
      tap((cart) => {
        this.cartSignal.set(cart);
        this.notifications.info('Item removido do carrinho.');
      }),
      catchError((error) => this.handleError(error, true))
    );
  }

  clear(): Observable<Cart> {
    return this.api.delete<Cart>(ApiEndpoints.cart).pipe(
      tap((cart) => {
        this.cartSignal.set(cart);
        this.notifications.info('Carrinho limpo.');
      }),
      catchError((error) => this.handleError(error, true))
    );
  }

  reset(): void {
    this.cartSignal.set(null);
  }

  private handleError(error: unknown, notify = false): Observable<never> {
    const message = this.apiError.getMessage(error);
    if (notify) {
      this.notifications.error(message);
    }
    return throwError(() => error);
  }
}
