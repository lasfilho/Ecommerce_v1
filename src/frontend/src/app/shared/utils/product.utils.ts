import { ProductListItem } from '../../core/models/catalog.models';

export function effectivePrice(
  product: Pick<ProductListItem, 'price' | 'promotionalPrice'>
): number {
  return product.promotionalPrice ?? product.price;
}

export function hasDiscount(product: Pick<ProductListItem, 'price' | 'promotionalPrice'>): boolean {
  return product.promotionalPrice != null && product.promotionalPrice < product.price;
}

export function discountPercent(
  product: Pick<ProductListItem, 'price' | 'promotionalPrice'>
): number {
  if (!hasDiscount(product) || !product.promotionalPrice) {
    return 0;
  }
  return Math.round(((product.price - product.promotionalPrice) / product.price) * 100);
}
