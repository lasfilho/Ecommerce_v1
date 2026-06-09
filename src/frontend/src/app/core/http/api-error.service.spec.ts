import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiErrorService } from './api-error.service';

describe('ApiErrorService', () => {
  let service: ApiErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiErrorService);
  });

  it('should map network errors', () => {
    const message = service.getMessage(new HttpErrorResponse({ status: 0 }));
    expect(message).toContain('conectar');
  });

  it('should map API error codes', () => {
    const message = service.getMessage(
      new HttpErrorResponse({
        status: 400,
        error: { code: 'Auth.InvalidCredentials' }
      })
    );
    expect(message).toContain('incorretos');
  });

  it('should map validation field errors', () => {
    const message = service.getMessage(
      new HttpErrorResponse({
        status: 400,
        error: { errors: { email: ['E-mail inválido.'] } }
      })
    );
    expect(message).toBe('E-mail inválido.');
  });
});
