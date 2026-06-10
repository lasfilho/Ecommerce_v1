import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCreditCard, LucideMail, LucideSmartphone } from '@lucide/angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LucideCreditCard, LucideSmartphone, LucideMail],
  template: `
    <footer class="mt-auto border-t border-border bg-header text-white">
      <div class="page-container py-10">
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div class="sm:col-span-2 lg:col-span-1">
            <p class="text-xl font-bold">Atelier</p>
            <p class="mt-2 max-w-xs text-sm leading-relaxed text-white/70">
              Marketplace com milhares de produtos, entrega rápida e as melhores ofertas do Brasil.
            </p>
            <div class="mt-4 flex gap-3">
              <span
                class="flex h-9 w-9 items-center justify-center rounded-md bg-white/10"
                title="App mobile"
              >
                <svg lucideSmartphone [size]="18"></svg>
              </span>
              <span
                class="flex h-9 w-9 items-center justify-center rounded-md bg-white/10"
                title="E-mail"
              >
                <svg lucideMail [size]="18"></svg>
              </span>
            </div>
          </div>

          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-white/50">Comprar</p>
            <ul class="mt-3 space-y-2 text-sm text-white/80">
              <li><a routerLink="/" class="hover:text-accent">Ofertas do dia</a></li>
              <li><a routerLink="/" class="hover:text-accent">Mais vendidos</a></li>
              <li><a routerLink="/cart" class="hover:text-accent">Meu carrinho</a></li>
            </ul>
          </div>

          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-white/50">Ajuda</p>
            <ul class="mt-3 space-y-2 text-sm text-white/80">
              <li>Central de atendimento</li>
              <li>Rastrear pedido</li>
              <li>Trocas e devoluções</li>
            </ul>
          </div>

          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-white/50">Pagamento</p>
            <div class="mt-3 flex items-center gap-2 text-white/80">
              <svg lucideCreditCard [size]="20"></svg>
              <span class="text-sm">Cartão, Pix e boleto</span>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              @for (method of paymentMethods; track method) {
                <span class="rounded bg-white/10 px-2 py-1 text-[10px] font-medium">{{
                  method
                }}</span>
              }
            </div>
          </div>
        </div>

        <div
          class="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>© {{ year }} Atelier Commerce. Todos os direitos reservados.</p>
          <p>Termos · Privacidade · Cookies</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  readonly paymentMethods = ['Visa', 'Master', 'Pix', 'Elo', 'Boleto'];
}
