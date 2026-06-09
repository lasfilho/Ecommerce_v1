import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly title = 'E-Commerce';
  readonly apiStatus = signal<string>('verificando...');
  protected readonly environment = environment;

  ngOnInit(): void {
    this.http.get<{ modules?: unknown }>(`${environment.apiUrl}/api/v1/status`).subscribe({
      next: () => this.apiStatus.set('online'),
      error: () => this.apiStatus.set('offline')
    });
  }
}
