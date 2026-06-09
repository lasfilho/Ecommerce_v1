import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ApiErrorService } from '../../../core/http/api-error.service';
import { AdminUser } from '../../../core/models/admin.models';
import { AdminUsersService } from '../../../core/services/admin-users.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { TableComponent } from '../../../shared/ui/table/table.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DatePipe, BadgeComponent, ButtonComponent, TableComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="font-display text-2xl font-semibold text-ink">Usuários</h1>
        <p class="mt-1 text-sm text-ink-muted">Gerencie contas e status de acesso.</p>
      </div>

      @if (loading()) {
        <div class="h-64 animate-pulse rounded-xl bg-surface-muted"></div>
      } @else if (error()) {
        <p class="text-danger">{{ error() }}</p>
      } @else {
        <ui-table>
          <thead tableHeader>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfis</th>
              <th>Status</th>
              <th>Cadastro</th>
              <th></th>
            </tr>
          </thead>
          <tbody tableBody>
            @for (user of users(); track user.id) {
              <tr>
                <td class="font-medium">{{ user.firstName }} {{ user.lastName }}</td>
                <td class="text-ink-muted">{{ user.email }}</td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    @for (role of user.roles; track role) {
                      <ui-badge [variant]="role === 'Admin' ? 'brand' : 'muted'">{{
                        role
                      }}</ui-badge>
                    }
                  </div>
                </td>
                <td>
                  <ui-badge [variant]="user.isActive ? 'brand' : 'danger'">
                    {{ user.isActive ? 'Ativo' : 'Inativo' }}
                  </ui-badge>
                </td>
                <td class="text-ink-muted">{{ user.createdAt | date: 'dd/MM/yyyy' }}</td>
                <td>
                  <ui-button
                    size="sm"
                    [variant]="user.isActive ? 'ghost' : 'secondary'"
                    [loading]="togglingId() === user.id"
                    (clicked)="toggleStatus(user)"
                  >
                    {{ user.isActive ? 'Desativar' : 'Ativar' }}
                  </ui-button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="py-10 text-center text-ink-muted">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            }
          </tbody>
        </ui-table>
      }
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private readonly usersService = inject(AdminUsersService);
  private readonly apiError = inject(ApiErrorService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly users = signal<AdminUser[]>([]);
  readonly togglingId = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  toggleStatus(user: AdminUser): void {
    this.togglingId.set(user.id);
    this.usersService
      .setUserStatus(user.id, !user.isActive)
      .pipe(
        finalize(() => this.togglingId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notifications.success('Status do usuário atualizado.');
          this.load();
        },
        error: (err) => this.notifications.error(this.apiError.getMessage(err))
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usersService
      .listUsers(1, 50)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (result) => this.users.set(result.items),
        error: (err) => this.error.set(this.apiError.getMessage(err))
      });
  }
}
