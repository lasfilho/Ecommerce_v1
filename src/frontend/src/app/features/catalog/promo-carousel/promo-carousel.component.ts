import {
  Component,
  DestroyRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import { LucideChevronLeft, LucideChevronRight, LucideZap } from '@lucide/angular';
import {
  PromotionBanner,
  promotionBannerBackground,
  promotionBannerClass
} from '../../../core/models/promotion.models';

@Component({
  selector: 'app-promo-carousel',
  standalone: true,
  imports: [LucideChevronLeft, LucideChevronRight, LucideZap],
  template: `
    <section
      class="relative overflow-hidden"
      (mouseenter)="pauseAutoplay()"
      (mouseleave)="resumeAutoplay()"
      aria-roledescription="carrossel"
      aria-label="Promoções e ofertas"
    >
      <div
        class="flex transition-transform duration-500 ease-out"
        [style.transform]="'translateX(-' + currentIndex() * 100 + '%)'"
      >
        @for (slide of slides(); track slide.slug; let i = $index) {
          <button
            type="button"
            class="relative w-full shrink-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            [class]="bannerClass(slide.backgroundClass) ?? ''"
            [style.background-color]="bannerBackground(slide.backgroundClass)"
            [attr.aria-label]="slide.title + ' — ver promoção'"
            [attr.aria-hidden]="i !== currentIndex()"
            (click)="openPromo(slide)"
          >
            <div
              class="page-container flex min-h-[9.5rem] flex-col items-start justify-between gap-4 py-6 sm:min-h-[11rem] sm:flex-row sm:items-center sm:py-8"
            >
              <div class="max-w-xl text-white">
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm"
                >
                  <svg lucideZap [size]="14"></svg>
                  {{ slide.tag }}
                </span>
                <h2 class="mt-3 text-xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                  {{ slide.title }}
                </h2>
                <p class="mt-2 text-sm text-white/90 sm:text-base">{{ slide.subtitle }}</p>
                <span
                  class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white underline-offset-4 hover:underline"
                >
                  Ver promoção
                  <svg lucideChevronRight [size]="16"></svg>
                </span>
              </div>

              @if (slide.highlight) {
                <div
                  class="hidden shrink-0 rounded-xl bg-white/15 px-8 py-5 text-center backdrop-blur-sm sm:block"
                >
                  <p class="text-3xl font-black text-white lg:text-4xl">{{ slide.highlight }}</p>
                  @if (slide.highlightLabel) {
                    <p class="text-sm font-medium text-white/90">{{ slide.highlightLabel }}</p>
                  }
                </div>
              }
            </div>
          </button>
        }
      </div>

      @if (slides().length > 1) {
        <button
          type="button"
          class="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40 sm:left-4"
          aria-label="Banner anterior"
          (click)="prev($event)"
        >
          <svg lucideChevronLeft [size]="22"></svg>
        </button>

        <button
          type="button"
          class="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40 sm:right-4"
          aria-label="Próximo banner"
          (click)="next($event)"
        >
          <svg lucideChevronRight [size]="22"></svg>
        </button>

        <div
          class="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2"
          role="tablist"
          aria-label="Indicadores do carrossel"
        >
          @for (slide of slides(); track slide.slug; let i = $index) {
            <button
              type="button"
              role="tab"
              [class]="indicatorClass(i)"
              [attr.aria-selected]="i === currentIndex()"
              [attr.aria-label]="'Ir para banner ' + (i + 1)"
              (click)="goTo(i, $event)"
            ></button>
          }
        </div>
      }
    </section>
  `
})
export class PromoCarouselComponent implements OnInit, OnDestroy {
  readonly slides = input.required<PromotionBanner[]>();

  protected readonly bannerBackground = promotionBannerBackground;
  protected readonly bannerClass = promotionBannerClass;

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentIndex = signal(0);

  private autoplayTimer: ReturnType<typeof setInterval> | null = null;
  private autoplayPaused = false;

  ngOnInit(): void {
    this.startAutoplay();
    this.destroyRef.onDestroy(() => this.stopAutoplay());
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  openPromo(slide: PromotionBanner): void {
    void this.router.navigate(['/'], {
      queryParams: { promo: slide.slug, q: null, category: null }
    });
  }

  prev(event: Event): void {
    event.stopPropagation();
    const total = this.slides().length;
    if (total === 0) return;
    this.currentIndex.update((i) => (i - 1 + total) % total);
  }

  next(event: Event): void {
    event.stopPropagation();
    const total = this.slides().length;
    if (total === 0) return;
    this.currentIndex.update((i) => (i + 1) % total);
  }

  goTo(index: number, event: Event): void {
    event.stopPropagation();
    this.currentIndex.set(index);
  }

  indicatorClass(index: number): string {
    const active = index === this.currentIndex();
    return active
      ? 'h-2 w-6 rounded-full bg-white transition-all'
      : 'h-2 w-2 rounded-full bg-white/50 transition-all';
  }

  pauseAutoplay(): void {
    this.autoplayPaused = true;
    this.stopAutoplay();
  }

  resumeAutoplay(): void {
    this.autoplayPaused = false;
    this.startAutoplay();
  }

  private startAutoplay(): void {
    if (this.autoplayPaused || this.slides().length <= 1) return;
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      const total = this.slides().length;
      if (total > 1) {
        this.currentIndex.update((i) => (i + 1) % total);
      }
    }, 6000);
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
}
