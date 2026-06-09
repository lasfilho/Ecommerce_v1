export type OrderStatus =
  | 'Pending'
  | 'Paid'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5;

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderStatusDates {
  paidAt?: string | null;
  processingAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AdminOrderSummary extends OrderSummary {
  userId: string;
  customerEmail: string;
  customerName: string;
}

export interface OrderDetail {
  id: string;
  cartId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  items: OrderItem[];
  statusDates: OrderStatusDates;
  createdAt: string;
  updatedAt?: string | null;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendente',
  Paid: 'Pago',
  Processing: 'Em processamento',
  Shipped: 'Enviado',
  Delivered: 'Entregue',
  Cancelled: 'Cancelado',
  '0': 'Pendente',
  '1': 'Pago',
  '2': 'Em processamento',
  '3': 'Enviado',
  '4': 'Entregue',
  '5': 'Cancelado'
};

export const ORDER_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'Pending', label: 'Pendente' },
  { value: 'Paid', label: 'Pago' },
  { value: 'Processing', label: 'Em processamento' },
  { value: 'Shipped', label: 'Enviado' },
  { value: 'Delivered', label: 'Entregue' },
  { value: 'Cancelled', label: 'Cancelado' }
];

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[String(status)] ?? String(status);
}

const STATUS_TO_NUMBER: Record<string, number> = {
  Pending: 0,
  Paid: 1,
  Processing: 2,
  Shipped: 3,
  Delivered: 4,
  Cancelled: 5
};

export function orderStatusToApi(status: OrderStatus | string): number {
  const key = String(status);
  if (STATUS_TO_NUMBER[key] != null) {
    return STATUS_TO_NUMBER[key];
  }
  const parsed = Number(key);
  return Number.isNaN(parsed) ? 0 : parsed;
}
