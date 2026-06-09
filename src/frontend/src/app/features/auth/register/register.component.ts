import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideUserPlus } from '@lucide/angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { InputComponent } from '../../../shared/ui/input/input.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CardComponent,
    ButtonComponent,
    InputComponent,
    LucideUserPlus
  ],
  template: `
    <section class="page-container flex min-h-[70vh] items-center justify-center py-12">
      <ui-card padding="lg" class="w-full max-w-md">
        <div class="mb-6 text-center">
          <span
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand"
          >
            <svg lucideUserPlus [size]="22"></svg>
          </span>
          <h1 class="mt-4 font-display text-2xl font-semibold text-ink">Criar conta</h1>
          <p class="mt-1 text-sm text-ink-muted">
            Cadastre-se para comprar e acompanhar seus pedidos.
          </p>
        </div>

        <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <div class="grid gap-4 sm:grid-cols-2">
            <ui-input
              label="Nome"
              placeholder="João"
              formControlName="firstName"
              [error]="fieldError('firstName')"
              [required]="true"
            />
            <ui-input
              label="Sobrenome"
              placeholder="Silva"
              formControlName="lastName"
              [error]="fieldError('lastName')"
              [required]="true"
            />
          </div>
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
            placeholder="Mínimo 8 caracteres"
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
            Cadastrar
          </ui-button>
        </form>

        <p class="mt-6 text-center text-sm text-ink-muted">
          Já tem conta?
          <a routerLink="/auth/login" class="font-medium text-brand hover:underline">Entrar</a>
        </p>
      </ui-card>
    </section>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]]
  });

  fieldError(controlName: 'firstName' | 'lastName' | 'email' | 'password'): string {
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
      .register(this.form.getRawValue())
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notifications.success('Conta criada com sucesso!');
          this.cart
            .refresh()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => void this.router.navigate(['/cart']),
              error: () => void this.router.navigate(['/cart'])
            });
        },
        error: (error) => this.errorMessage.set(this.auth.getErrorMessage(error))
      });
  }
}
