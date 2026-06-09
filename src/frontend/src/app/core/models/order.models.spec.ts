import { orderStatusLabel, orderStatusToApi } from './order.models';

describe('order.models', () => {
  it('orderStatusLabel should translate known statuses', () => {
    expect(orderStatusLabel('Pending')).toBe('Pendente');
    expect(orderStatusLabel(1)).toBe('Pago');
  });

  it('orderStatusToApi should convert labels to numeric enum', () => {
    expect(orderStatusToApi('Shipped')).toBe(3);
    expect(orderStatusToApi(4)).toBe(4);
  });
});
