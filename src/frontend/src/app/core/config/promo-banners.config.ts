import { ProductListItem } from '../models/catalog.models';
import { hasDiscount } from '../../shared/utils/product.utils';

export interface PromoBannerSlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  highlight?: string;
  highlightLabel?: string;
  /** Classes Tailwind para o fundo do slide (gradiente ou cor sólida). */
  backgroundClass: string;
  /** Slug usado em `/?promo=slug` ao clicar no banner. */
  promoSlug: string;
}

export interface PromoCampaign {
  slug: string;
  pageTitle: string;
  pageSubtitle: string;
  filter: (product: ProductListItem) => boolean;
}

/** Slides exibidos no carrossel da home — fácil de expandir ou mover para API/admin depois. */
export const PROMO_BANNER_SLIDES: PromoBannerSlide[] = [
  {
    id: 'mega-ofertas',
    tag: 'Mega Ofertas',
    title: 'Até 50% OFF em produtos selecionados',
    subtitle: 'Frete grátis acima de R$ 99 · Parcelamento em até 12x sem juros',
    highlight: '50%',
    highlightLabel: 'de desconto',
    backgroundClass: 'bg-gradient-to-r from-brand via-[#ff6b35] to-accent',
    promoSlug: 'mega-ofertas'
  },
  {
    id: 'dia-das-maes',
    tag: 'Dia das Mães',
    title: 'Presentes especiais para quem você ama',
    subtitle: 'Seleção curada com os melhores preços da temporada',
    highlight: 'MÃES',
    highlightLabel: 'promoção',
    backgroundClass: 'bg-gradient-to-r from-[#be185d] via-[#db2777] to-[#f472b6]',
    promoSlug: 'dia-das-maes'
  },
  {
    id: 'frete-gratis',
    tag: 'Frete Grátis',
    title: 'Compre com entrega gratuita',
    subtitle: 'Válido para pedidos acima de R$ 99 em todo o Brasil',
    highlight: 'R$0',
    highlightLabel: 'de frete',
    backgroundClass: 'bg-gradient-to-r from-[#067d62] via-[#059669] to-[#34d399]',
    promoSlug: 'frete-gratis'
  },
  {
    id: 'eletronicos',
    tag: 'Tecnologia',
    title: 'Eletrônicos com preços imperdíveis',
    subtitle: 'Fones, acessórios e gadgets com entrega rápida',
    highlight: 'TECH',
    highlightLabel: 'seleção',
    backgroundClass: 'bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#60a5fa]',
    promoSlug: 'eletronicos'
  },
  {
    id: 'lancamentos',
    tag: 'Novidades',
    title: 'Confira os lançamentos da semana',
    subtitle: 'Produtos recém-chegados ao catálogo',
    highlight: 'NEW',
    highlightLabel: 'lançamentos',
    backgroundClass: 'bg-gradient-to-r from-[#4c1d95] via-[#7c3aed] to-[#a78bfa]',
    promoSlug: 'lancamentos'
  }
];

const MOTHERS_DAY_KEYWORDS = ['fone', 'bluetooth', 'presente', 'áudio', 'som'];

/** Campanhas vinculadas aos banners — definem quais produtos aparecem em cada promoção. */
export const PROMO_CAMPAIGNS: PromoCampaign[] = [
  {
    slug: 'mega-ofertas',
    pageTitle: 'Mega Ofertas',
    pageSubtitle: 'Produtos com desconto ativo no momento',
    filter: (p) => hasDiscount(p)
  },
  {
    slug: 'dia-das-maes',
    pageTitle: 'Dia das Mães',
    pageSubtitle: 'Presentes selecionados para celebrar quem você ama',
    filter: (p) => {
      const text = `${p.name} ${p.shortDescription ?? ''}`.toLowerCase();
      return (
        hasDiscount(p) ||
        MOTHERS_DAY_KEYWORDS.some((kw) => text.includes(kw)) ||
        p.category.name.toLowerCase().includes('eletrôn')
      );
    }
  },
  {
    slug: 'frete-gratis',
    pageTitle: 'Frete Grátis',
    pageSubtitle: 'Compras elegíveis para entrega sem custo adicional',
    filter: (p) => (p.promotionalPrice ?? p.price) >= 99
  },
  {
    slug: 'eletronicos',
    pageTitle: 'Eletrônicos',
    pageSubtitle: 'Tudo em tecnologia e acessórios',
    filter: (p) => p.category.slug === 'eletronicos'
  },
  {
    slug: 'lancamentos',
    pageTitle: 'Lançamentos',
    pageSubtitle: 'Os produtos mais recentes do catálogo',
    filter: () => true
  }
];

export function getPromoCampaign(slug: string | null | undefined): PromoCampaign | undefined {
  if (!slug) return undefined;
  return PROMO_CAMPAIGNS.find((c) => c.slug === slug);
}

export function getPromoBannerBySlug(slug: string | null | undefined): PromoBannerSlide | undefined {
  if (!slug) return undefined;
  return PROMO_BANNER_SLIDES.find((b) => b.promoSlug === slug);
}
