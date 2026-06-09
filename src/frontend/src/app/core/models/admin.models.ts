import { PagedResult } from './catalog.models';

export interface AdminDashboard {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalCategories: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalUsers: number;
  activeUsers: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentCategoryId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string | null;
  description?: string | null;
  parentCategoryId?: string | null;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}

export interface ProductImageInput {
  url: string;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface CreateProductRequest {
  categoryId: string;
  name: string;
  slug?: string | null;
  sku: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  price: number;
  promotionalPrice?: number | null;
  stockQuantity: number;
  images?: ProductImageInput[] | null;
}

export interface UpdateProductRequest extends CreateProductRequest {}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  updatedAt?: string | null;
}

export type PagedUsers = PagedResult<AdminUser>;
