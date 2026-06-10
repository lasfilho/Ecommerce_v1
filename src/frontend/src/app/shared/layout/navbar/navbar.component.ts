import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideLayoutDashboard,
  LucideLogOut,
  LucideMenu,
  LucideSearch,
  LucideShoppingCart,
  LucideUser,
  LucideX
} from '@lucide/angular';
import { CategorySummary } from '../../../core/models/catalog.models';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { CatalogService } from '../../../core/services/catalog.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    LucideSearch,
    LucideShoppingCart,
    LucideUser,
    LucideLogOut,
    LucideLayoutDashboard,
    LucideMenu,
    LucideX
  ],
  template: `
    <header class="sticky top-0 z-50 bg-header text-white shadow-md">
      <!-- Linha principal -->
      <div class="page-container flex items-center gap-2 py-2 sm:gap-4 sm:py-2.5">
        <button
          type="button"
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md hover:bg-white/10 lg:hidden"
          [attr.aria-expanded]="mobileMenuOpen()"
          aria-label="Menu"
          (click)="toggleMobileMenu()"
        >
          @if (mobileMenuOpen()) {
            <svg lucideX [size]="22"></svg>
          } @else {
            <svg lucideMenu [size]="22"></svg>
          }
        </button>

        <a
          routerLink="/"
          class="flex shrink-0 items-center gap-2 rounded-md px-1 py-1 hover:outline hover:outline-1 hover:outline-white/40"
          (click)="closeMobileMenu()"
        >
          <span
            class="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-sm font-black text-white"
          >
            A
          </span>
          <span class="hidden text-lg font-bold tracking-tight sm:inline">Atelier</span>
        </a>

        <!-- Busca desktop -->
        <form
          class="header-search mx-2 hidden max-w-3xl flex-1 md:flex"
          (ngSubmit)="submitSearch()"
        >
          <input
            class="header-search-input"
            type="search"
            placeholder="Buscar produtos, marcas e categorias..."
            [(ngModel)]="searchQuery"
            name="searchDesktop"
          />
          <button type="submit" class="header-search-btn" aria-label="Buscar">
            <svg lucideSearch [size]="20"></svg>
          </button>
        </form>

        <!-- Ações -->
        <div class="ml-auto flex items-center gap-1 sm:gap-2">
          @if (auth.isAuthenticated()) {
            <div class="hidden flex-col leading-tight lg:flex">
              <span class="text-[10px] text-white/70">Olá, {{ firstName() }}</span>
              <a routerLink="/cart" class="text-xs font-semibold hover:text-accent">Conta e pedidos</a>
            </div>

            @if (auth.isAdmin()) {
              <a
                routerLink="/admin"
                class="hidden items-center gap-1 rounded-md px-2 py-2 text-xs hover:bg-white/10 lg:inline-flex"
              >
                <svg lucideLayoutDashboard [size]="16"></svg>
                Admin
              </a>
            }

            <a
              routerLink="/cart"
              class="relative flex flex-col items-center rounded-md px-2 py-1 hover:bg-white/10 sm:px-3"
              (click)="closeMobileMenu()"
            >
              <svg lucideShoppingCart [size]="22"></svg>
              <span class="hidden text-[10px] font-medium sm:block">Carrinho</span>
              @if (cart.itemCount() > 0) {
                <span
                  class="absolute -right-0.5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-header"
                >
                  {{ cart.itemCount() }}
                </span>
              }
            </a>

            <button
              type="button"
              class="hidden items-center gap-1 rounded-md px-2 py-2 text-xs hover:bg-white/10 md:inline-flex"
              (click)="logout()"
            >
              <svg lucideLogOut [size]="16"></svg>
              Sair
            </button>
          } @else {
            <a
              routerLink="/auth/login"
              class="flex flex-col items-center rounded-md px-2 py-1 hover:bg-white/10 sm:px-3"
              (click)="closeMobileMenu()"
            >
              <svg lucideUser [size]="22"></svg>
              <span class="hidden text-[10px] font-medium sm:block">Entrar</span>
            </a>

            <a
              routerLink="/cart"
              class="relative flex flex-col items-center rounded-md px-2 py-1 hover:bg-white/10 sm:px-3"
            >
              <svg lucideShoppingCart [size]="22"></svg>
              <span class="hidden text-[10px] font-medium sm:block">Carrinho</span>
            </a>
          }
        </div>
      </div>

      <!-- Busca mobile -->
      <form class="page-container pb-2 md:hidden" (ngSubmit)="submitSearch()">
        <div class="header-search">
          <input
            class="header-search-input"
            type="search"
            placeholder="Buscar produtos..."
            [(ngModel)]="searchQuery"
            name="searchMobile"
          />
          <button type="submit" class="header-search-btn" aria-label="Buscar">
            <svg lucideSearch [size]="20"></svg>
          </button>
        </div>
      </form>

      <!-- Faixa de categorias -->
      <div class="hidden border-t border-white/10 bg-header-secondary md:block">
        <div class="page-container flex items-center gap-1 overflow-x-auto py-1.5 text-xs scrollbar-none">
          <a
            routerLink="/"
            [queryParams]="{}"
            class="shrink-0 rounded px-3 py-1.5 font-medium hover:bg-white/10"
          >
            Todas as ofertas
          </a>
          @for (category of categories(); track category.id) {
            <a
              [routerLink]="['/']"
              [queryParams]="{ category: category.id }"
              class="shrink-0 rounded px-3 py-1.5 hover:bg-white/10"
            >
              {{ category.name }}
            </a>
          }
          <span class="shrink-0 rounded px-3 py-1.5 text-accent">Frete grátis*</span>
          <span class="shrink-0 rounded px-3 py-1.5 text-accent">Ofertas do dia</span>
        </div>
      </div>

      <!-- Menu mobile expandido -->
      @if (mobileMenuOpen()) {
        <nav class="border-t border-white/10 bg-header-secondary lg:hidden" aria-label="Menu mobile">
          <div class="page-container space-y-1 py-3 text-sm">
            <a
              routerLink="/"
              class="block rounded-md px-3 py-2 hover:bg-white/10"
              (click)="closeMobileMenu()"
            >
              Início
            </a>
            @for (category of categories(); track category.id) {
              <a
                [routerLink]="['/']"
                [queryParams]="{ category: category.id }"
                class="block rounded-md px-3 py-2 hover:bg-white/10"
                (click)="closeMobileMenu()"
              >
                {{ category.name }}
              </a>
            }
            @if (auth.isAuthenticated()) {
              <a
                routerLink="/cart"
                class="block rounded-md px-3 py-2 hover:bg-white/10"
                (click)="closeMobileMenu()"
              >
                Meu carrinho ({{ cart.itemCount() }})
              </a>
              @if (auth.isAdmin()) {
                <a
                  routerLink="/admin"
                  class="block rounded-md px-3 py-2 hover:bg-white/10"
                  (click)="closeMobileMenu()"
                >
                  Painel Admin
                </a>
              }
              <button
                type="button"
                class="block w-full rounded-md px-3 py-2 text-left hover:bg-white/10"
                (click)="logoutFromMobile()"
              >
                Sair
              </button>
            } @else {
              <a
                routerLink="/auth/register"
                class="block rounded-md px-3 py-2 hover:bg-white/10"
                (click)="closeMobileMenu()"
              >
                Criar conta
              </a>
            }
          </div>
        </nav>
      }
    </header>
  `
})
export class NavbarComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly mobileMenuOpen = signal(false);
  readonly categories = signal<CategorySummary[]>([]);
  searchQuery = '';

  readonly firstName = computed(() => {
    const name = this.auth.displayName();
    return name?.split(' ')[0] ?? 'visitante';
  });

  ngOnInit(): void {
    this.catalog
      .listCategories(true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.categories.set(items)
      });
  }

  submitSearch(): void {
    const q = this.searchQuery.trim();
    void this.router.navigate(['/'], {
      queryParams: { q: q || null, category: null }
    });
    this.closeMobileMenu();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logoutFromMobile(): void {
    this.closeMobileMenu();
    this.logout();
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.cart.reset()
    });
  }
}
