import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { AdminLayoutComponent } from './features/admin/layout/admin-layout.component';
import { AdminCategoriesComponent } from './features/admin/categories/admin-categories.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { AdminOrderDetailComponent } from './features/admin/orders/admin-order-detail.component';
import { AdminOrdersComponent } from './features/admin/orders/admin-orders.component';
import { AdminProductFormComponent } from './features/admin/products/admin-product-form.component';
import { AdminProductsComponent } from './features/admin/products/admin-products.component';
import { AdminPromotionFormComponent } from './features/admin/promotions/admin-promotion-form.component';
import { AdminPromotionsComponent } from './features/admin/promotions/admin-promotions.component';
import { AdminUsersComponent } from './features/admin/users/admin-users.component';
import { CartPageComponent } from './features/cart/cart-page/cart-page.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ProductDetailComponent } from './features/catalog/product-detail/product-detail.component';
import { ProductListComponent } from './features/catalog/product-list/product-list.component';
import { PublicLayoutComponent } from './shared/layout/public-layout/public-layout.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminDashboardComponent, title: 'Dashboard · Admin' },
      { path: 'products', component: AdminProductsComponent, title: 'Produtos · Admin' },
      { path: 'products/new', component: AdminProductFormComponent, title: 'Novo produto · Admin' },
      {
        path: 'products/:id/edit',
        component: AdminProductFormComponent,
        title: 'Editar produto · Admin'
      },
      { path: 'categories', component: AdminCategoriesComponent, title: 'Categorias · Admin' },
      { path: 'promotions', component: AdminPromotionsComponent, title: 'Promoções · Admin' },
      {
        path: 'promotions/new',
        component: AdminPromotionFormComponent,
        title: 'Nova promoção · Admin'
      },
      {
        path: 'promotions/:id/edit',
        component: AdminPromotionFormComponent,
        title: 'Editar promoção · Admin'
      },
      { path: 'orders', component: AdminOrdersComponent, title: 'Pedidos · Admin' },
      {
        path: 'orders/:id',
        component: AdminOrderDetailComponent,
        title: 'Detalhe do pedido · Admin'
      },
      { path: 'users', component: AdminUsersComponent, title: 'Usuários · Admin' }
    ]
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: ProductListComponent, title: 'Catálogo · Atelier Commerce' },
      {
        path: 'products/:id',
        component: ProductDetailComponent,
        title: 'Produto · Atelier Commerce'
      },
      {
        path: 'cart',
        component: CartPageComponent,
        canActivate: [authGuard],
        title: 'Carrinho · Atelier Commerce'
      },
      {
        path: 'auth/login',
        component: LoginComponent,
        canActivate: [guestGuard],
        title: 'Entrar · Atelier Commerce'
      },
      {
        path: 'auth/register',
        component: RegisterComponent,
        canActivate: [guestGuard],
        title: 'Cadastro · Atelier Commerce'
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
