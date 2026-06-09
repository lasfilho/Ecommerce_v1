import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { isAuthenticated: () => false }
        },
        {
          provide: Router,
          useValue: {
            createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({} as UrlTree)
          }
        }
      ]
    });
  });

  it('should redirect unauthenticated users to login', () => {
    const router = TestBed.inject(Router);

    TestBed.runInInjectionContext(() => authGuard({} as never, { url: '/cart' } as never));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/cart' }
    });
  });
});
