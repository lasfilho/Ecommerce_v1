export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string | null;
  price: number;
  promotionalPrice?: number | null;
  stockQuantity: number;
  isActive: boolean;
  category: CategorySummary;
  primaryImage?: ProductImage | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ProductDetail extends ProductListItem {
  longDescription?: string | null;
  images: ProductImage[];
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
  search?: string;
}
