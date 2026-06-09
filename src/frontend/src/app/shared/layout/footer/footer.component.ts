import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="mt-auto border-t border-border bg-surface-elevated">
      <div class="page-container py-10">
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div class="sm:col-span-2">
            <p class="font-display text-xl font-semibold text-ink">Atelier Commerce</p>
            <p class="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
              Curadoria de produtos com experiência leve, visual refinado e foco em desempenho.
            </p>
          </div>

          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-ink-faint">Navegação</p>
            <ul class="mt-3 space-y-2 text-sm text-ink-muted">
              <li><a routerLink="/" class="transition-colors hover:text-brand">Catálogo</a></li>
              <li><a routerLink="/cart" class="transition-colors hover:text-brand">Carrinho</a></li>
            </ul>
          </div>

          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-ink-faint">Suporte</p>
            <ul class="mt-3 space-y-2 text-sm text-ink-muted">
              <li>Entregas em todo o Brasil</li>
              <li>Trocas em até 30 dias</li>
              <li>Atendimento 9h–18h</li>
            </ul>
          </div>
        </div>

        <div
          class="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between"
        >
          <p>© {{ year }} Atelier Commerce. Todos os direitos reservados.</p>
          <p>Angular + Tailwind · Modular Monolith API</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
