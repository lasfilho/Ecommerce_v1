import { effectivePrice, discountPercent, hasDiscount } from './product.utils';

describe('product.utils', () => {
  const product = {
    price: 100,
    promotionalPrice: 75 as number | null
  };

  it('effectivePrice should prefer promotional price', () => {
    expect(effectivePrice(product)).toBe(75);
  });

  it('hasDiscount should detect promotional price below list price', () => {
    expect(hasDiscount(product)).toBeTrue();
    expect(hasDiscount({ price: 100, promotionalPrice: null })).toBeFalse();
  });

  it('discountPercent should calculate rounded percentage', () => {
    expect(discountPercent(product)).toBe(25);
  });
});
