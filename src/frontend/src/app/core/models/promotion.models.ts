import { ProductListItem } from './catalog.models';
import {
  EXCEL_STANDARD_COLORS,
  EXCEL_THEME_COLOR_COLUMNS,
  getExcelPaletteColors
} from './excel-color-palette';

export type PromotionFilterType =
  | 'AllProducts'
  | 'HasDiscount'
  | 'Category'
  | 'MinPrice'
  | 'Keywords'
  | 'ProductIds';

export interface PromotionBanner {
  slug: string;
  tag: string;
  title: string;
  subtitle: string;
  highlight?: string | null;
  highlightLabel?: string | null;
  backgroundClass: string;
}

export interface Promotion {
  id: string;
  slug: string;
  tag: string;
  title: string;
  subtitle: string;
  highlight?: string | null;
  highlightLabel?: string | null;
  backgroundClass: string;
  filterType: PromotionFilterType;
  categoryId?: string | null;
  minPrice?: number | null;
  keywords?: string | null;
  productIds: string[];
  displayOrder: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PromotionFormValue {
  slug: string;
  tag: string;
  title: string;
  subtitle: string;
  highlight?: string;
  highlightLabel?: string;
  backgroundClass: string;
  filterType: PromotionFilterType;
  categoryId?: string | null;
  minPrice?: number | null;
  keywords?: string;
  productIds: string[];
  displayOrder: number;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface PromotionProductsResult {
  items: ProductListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const PROMOTION_FILTER_OPTIONS: { value: PromotionFilterType; label: string; hint: string }[] =
  [
    {
      value: 'AllProducts',
      label: 'Todos os produtos ativos',
      hint: 'Lista sempre atualizada com todo o catálogo ativo.'
    },
    {
      value: 'HasDiscount',
      label: 'Produtos com desconto',
      hint: 'Inclui automaticamente itens com preço promocional.'
    },
    {
      value: 'Category',
      label: 'Por categoria',
      hint: 'Novos produtos da categoria entram na promoção automaticamente.'
    },
    {
      value: 'MinPrice',
      label: 'Preço mínimo',
      hint: 'Produtos acima do valor definido (ex.: frete grátis R$ 99).'
    },
    {
      value: 'Keywords',
      label: 'Palavras-chave',
      hint: 'Busca no nome/descrição — ideal para campanhas temáticas (ex.: Dia das Mães).'
    },
    {
      value: 'ProductIds',
      label: 'Produtos específicos',
      hint: 'Seleção manual de produtos para a campanha.'
    }
  ];

export const PROMOTION_THEME_COLUMNS = EXCEL_THEME_COLOR_COLUMNS;
export const PROMOTION_STANDARD_COLORS = EXCEL_STANDARD_COLORS;

export function getAllPromotionPaletteColors(): string[] {
  return getExcelPaletteColors();
}

/** @deprecated Use getAllPromotionPaletteColors(). */
export const PROMOTION_BANNER_COLORS: readonly string[] = getAllPromotionPaletteColors();

/** Laranja-tema do Excel — boa cor padrão para banners promocionais. */
export const PROMOTION_DEFAULT_BANNER_COLOR = '#ED7D31';

export function isPromotionHexColor(background: string): boolean {
  return background.startsWith('#');
}

/** Chave normalizada para comparar/selecionar cor no painel (hex ou 1º hex de gradiente legado). */
export function promotionColorKey(background: string): string {
  if (!background) {
    return '';
  }

  if (isPromotionHexColor(background)) {
    return background.toLowerCase();
  }

  const hex = background.match(/#[0-9a-fA-F]{6}/)?.[0];
  return hex ? hex.toLowerCase() : background;
}

export function promotionBannerBackground(background: string): string | undefined {
  return isPromotionHexColor(background) ? background : undefined;
}

export function promotionBannerClass(background: string): string | undefined {
  return isPromotionHexColor(background) ? undefined : background;
}
