/**
 * Paleta oficial do seletor de cores do Microsoft Excel (tema Office).
 * Matriz 10×6: 1 linha base + 5 variações por coluna.
 */
export const EXCEL_THEME_COLOR_COLUMNS: readonly (readonly string[])[] = [
  ['#FFFFFF', '#F2F2F2', '#D8D8D8', '#BFBFBF', '#A5A5A5', '#7F7F7F'],
  ['#000000', '#7F7F7F', '#595959', '#3F3F3F', '#262626', '#0C0C0C'],
  ['#E7E6E6', '#D0CECE', '#AEABAB', '#757070', '#3A3838', '#1A1919'],
  ['#44546A', '#D6DCE5', '#ADB9CA', '#8497B0', '#333F50', '#222A35'],
  ['#4472C4', '#D9E2F3', '#B4C7E7', '#8FAADC', '#2F5597', '#1F3864'],
  ['#ED7D31', '#FBE5D6', '#F7CBAC', '#F4B183', '#C55A11', '#833C0C'],
  ['#A5A5A5', '#E2E2E2', '#C9C9C9', '#B0B0B0', '#7B7B7B', '#525252'],
  ['#FFC000', '#FFF2CC', '#FFE699', '#FFD966', '#BF9000', '#7F6000'],
  ['#5B9BD5', '#DEEBF7', '#BDD7EE', '#9DC3E6', '#2E75B6', '#1F4E79'],
  ['#70AD47', '#E2EFDA', '#C6E0B4', '#A9D08E', '#548235', '#385723']
] as const;

/** 10 cores padrão do Excel (linha inferior). */
export const EXCEL_STANDARD_COLORS: readonly string[] = [
  '#C00000',
  '#FF0000',
  '#FFC000',
  '#FFFF00',
  '#92D050',
  '#00B050',
  '#00B0F0',
  '#0070C0',
  '#002060',
  '#7030A0'
] as const;

const RECENT_COLORS_KEY = 'ecommerce.promotion.recent-colors';
const MAX_RECENT = 10;

export function getExcelPaletteColors(): string[] {
  return [...EXCEL_THEME_COLOR_COLUMNS.flat(), ...EXCEL_STANDARD_COLORS];
}

/** Extrai hex do valor salvo (# ou dentro de classe legada). */
export function resolveBannerHexColor(background: string): string | null {
  const trimmed = background.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  const hex = trimmed.match(/#[0-9a-fA-F]{6}/)?.[0];
  return hex ? hex.toLowerCase() : null;
}

export function normalizeExcelColorKey(color: string): string {
  return color.trim().toLowerCase();
}

/** Cor exata da paleta Excel que corresponde ao valor (case-insensitive). */
export function findExactExcelPaletteColor(background: string): string | undefined {
  const key = resolveBannerHexColor(background) ?? normalizeExcelColorKey(background);
  return getExcelPaletteColors().find((c) => normalizeExcelColorKey(c) === key);
}

export function isColorInExcelPalette(background: string): boolean {
  return findExactExcelPaletteColor(background) !== undefined;
}

export function loadExcelRecentColors(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_COLORS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((c): c is string => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c))
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function saveExcelRecentColor(color: string): string[] {
  const normalized = color.toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(normalized)) {
    return loadExcelRecentColors();
  }

  const next = [normalized, ...loadExcelRecentColors().filter((c) => c !== normalized)].slice(
    0,
    MAX_RECENT
  );

  localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(next));
  return next;
}

/** Borda sutil em swatches muito claros (ex.: branco do Excel). */
export function excelSwatchNeedsBorder(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.88;
}
