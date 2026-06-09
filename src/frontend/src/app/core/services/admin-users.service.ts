import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../config/api.config';
import { ApiHttpService } from '../http/api-http.service';
import { AdminUser, PagedUsers } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly api = inject(ApiHttpService);

  listUsers(page = 1, pageSize = 20): Observable<PagedUsers> {
    return this.api.get<PagedUsers>(ApiEndpoints.admin.users, {
      params: { page, pageSize }
    });
  }

  setUserStatus(id: string, isActive: boolean): Observable<AdminUser> {
    return this.api.patch<AdminUser>(`${ApiEndpoints.admin.users}/${id}/status`, { isActive });
  }
}
