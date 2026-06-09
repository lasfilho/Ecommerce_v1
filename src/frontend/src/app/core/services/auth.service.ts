import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { ApiEndpoints } from '../config/api.config';
import { ApiErrorService } from '../http/api-error.service';
import { ApiHttpService } from '../http/api-http.service';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  StoredAuthSession,
  UserProfile
} from '../models/auth.models';

const SESSION_KEY = 'ecommerce_auth_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiHttpService);
  private readonly apiError = inject(ApiErrorService);
  private readonly router = inject(Router);

  private readonly sessionSignal = signal<StoredAuthSession | null>(this.readSession());
  private readonly userSignal = signal<UserProfile | null>(null);
  private readonly loadingSignal = signal(false);

  readonly session = this.sessionSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly isAdmin = computed(() => this.hasRole('Admin'));
  readonly displayName = computed(() => {
    const user = this.userSignal();
    return user ? `${user.firstName} ${user.lastName}`.trim() : null;
  });

  accessToken(): string | null {
    return this.sessionSignal()?.accessToken ?? null;
  }

  refreshToken(): string | null {
    return this.sessionSignal()?.refreshToken ?? null;
  }

  /** @deprecated Use accessToken() — mantido para compatibilidade com interceptor antigo */
  token(): string | null {
    return this.accessToken();
  }

  initialize(): Observable<UserProfile | null> {
    if (!this.isAuthenticated()) {
      return of(null);
    }

    return this.loadProfile().pipe(
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  login(request: LoginRequest): Observable<UserProfile> {
    this.loadingSignal.set(true);

    return this.api.post<AuthResponse>(ApiEndpoints.auth.login, request).pipe(
      tap((response) => this.persistSession(response)),
      switchMap(() => this.loadProfile()),
      tap(() => this.loadingSignal.set(false)),
      catchError((error) => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  register(request: RegisterRequest): Observable<UserProfile> {
    this.loadingSignal.set(true);

    return this.api.post<AuthResponse>(ApiEndpoints.auth.register, request).pipe(
      tap((response) => this.persistSession(response)),
      switchMap(() => this.loadProfile()),
      tap(() => this.loadingSignal.set(false)),
      catchError((error) => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  loadProfile(): Observable<UserProfile> {
    return this.api
      .get<UserProfile>(ApiEndpoints.auth.me)
      .pipe(tap((profile) => this.userSignal.set(profile)));
  }

  refreshSession(): Observable<StoredAuthSession> {
    const refreshToken = this.refreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token ausente'));
    }

    return this.api.post<AuthResponse>(ApiEndpoints.auth.refresh, { refreshToken }).pipe(
      tap((response) => this.persistSession(response)),
      map(() => this.sessionSignal()!)
    );
  }

  logout(redirectToLogin = false): Observable<void> {
    const refreshToken = this.refreshToken();

    const revoke$ = refreshToken
      ? this.api
          .post<void>(ApiEndpoints.auth.revoke, { refreshToken })
          .pipe(catchError(() => of(void 0)))
      : of(void 0);

    return revoke$.pipe(
      tap(() => {
        this.clearSession();
        if (redirectToLogin) {
          void this.router.navigate(['/auth/login']);
        }
      })
    );
  }

  private persistSession(response: AuthResponse): void {
    const session: StoredAuthSession = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      accessTokenExpiresAt: response.accessTokenExpiresAt
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  private clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    this.sessionSignal.set(null);
    this.userSignal.set(null);
  }

  private readSession(): StoredAuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredAuthSession;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  hasRole(role: string): boolean {
    return this.userSignal()?.roles.includes(role) ?? false;
  }

  getErrorMessage(error: unknown): string {
    return this.apiError.getMessage(error);
  }
}
