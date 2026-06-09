import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideLogIn } from '@lucide/angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { InputComponent } from '../../../shared/ui/input/input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CardComponent,
    ButtonComponent,
    InputComponent,
    LucideLogIn
  ],
  template: `
    <section class="page-container flex min-h-[70vh] items-center justify-center py-12">
      <ui-card padding="lg" class="w-full max-w-md">
        <div class="mb-6 text-center">
          <span
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand"
          >
            <svg lucideLogIn [size]="22"></svg>
          </span>
          <h1 class="mt-4 font-display text-2xl font-semibold text-ink">Entrar</h1>
          <p class="mt-1 text-sm text-ink-muted">
            Acesse sua conta para usar o carrinho e finalizar pedidos.
          </p>
        </div>

        <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <ui-input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            formControlName="email"
            [error]="fieldError('email')"
            [required]="true"
          />
          <ui-input
            label="Senha"
            type="password"
            placeholder="••••••••"
            formControlName="password"
            [error]="fieldError('password')"
            [required]="true"
          />

          @if (errorMessage()) {
            <p class="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {{ errorMessage() }}
            </p>
          }

          <ui-button type="submit" variant="primary" [fullWidth]="true" [loading]="submitting()">
            Entrar
          </ui-button>
        </form>

        <p class="mt-6 text-center text-sm text-ink-muted">
          Não tem conta?
          <a routerLink="/auth/register" class="font-medium text-brand hover:underline"
            >Cadastre-se</a
          >
        </p>
      </ui-card>
    </section>
  `
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  private returnUrl = '/';

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/cart';
  }

  fieldError(controlName: 'email' | 'password'): string {
    const control = this.form.controls[controlName];
    if (!control.touched || !control.errors) {
      return '';
    }
    if (control.errors['required']) {
      return 'Campo obrigatório.';
    }
    if (control.errors['email']) {
      return 'E-mail inválido.';
    }
    if (control.errors['minlength']) {
      return 'Mínimo de 8 caracteres.';
    }
    return 'Valor inválido.';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.auth
      .login(this.form.getRawValue())
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notifications.success('Login realizado com sucesso.');
          this.cart
            .refresh()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => void this.router.navigateByUrl(this.returnUrl),
              error: () => void this.router.navigateByUrl(this.returnUrl)
            });
        },
        error: (error) => this.errorMessage.set(this.auth.getErrorMessage(error))
      });
  }
}
