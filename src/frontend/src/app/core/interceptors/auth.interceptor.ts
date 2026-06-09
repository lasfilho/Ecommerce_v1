import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const AUTH_SKIP_PATHS = ['/auth/login', '/auth/register', '/auth/refresh-token'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isAuthEndpoint = AUTH_SKIP_PATHS.some((path) => req.url.includes(path));

  const token = auth.accessToken();
  const authReq =
    token && !isAuthEndpoint
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !isAuthEndpoint &&
        auth.refreshToken() &&
        !req.headers.has('X-Retry-After-Refresh')
      ) {
        return auth.refreshSession().pipe(
          switchMap(() => {
            const retryReq = authReq.clone({
              setHeaders: {
                Authorization: `Bearer ${auth.accessToken()}`,
                'X-Retry-After-Refresh': 'true'
              }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            auth.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
