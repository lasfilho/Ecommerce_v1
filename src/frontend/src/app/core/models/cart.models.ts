export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isAvailable: boolean;
  availableStock: number;
}

export interface Cart {
  id: string;
  status: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  createdAt: string;
  updatedAt?: string | null;
}
