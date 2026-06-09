import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../config/api.config';
import { ApiHttpService } from '../http/api-http.service';
import { AdminDashboard } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly api = inject(ApiHttpService);

  getDashboard(): Observable<AdminDashboard> {
    return this.api.get<AdminDashboard>(ApiEndpoints.admin.dashboard);
  }
}
