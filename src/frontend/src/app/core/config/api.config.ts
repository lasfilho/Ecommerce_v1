/** Rotas da API — paths relativos ao apiBaseUrl do environment. */
export const ApiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh-token',
    revoke: '/auth/revoke-token',
    me: '/auth/me'
  },
  products: '/products',
  categories: '/categories',
  cart: '/cart',
  orders: '/orders',
  admin: {
    dashboard: '/admin/dashboard',
    orders: '/admin/orders',
    users: '/admin/users'
  }
} as const;
