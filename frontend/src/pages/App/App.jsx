import { useRoutes, BrowserRouter, Navigate } from 'react-router-dom';
import { HomePage, ShopPage, ProductPage, CartPage, WishlistPage, CheckoutPage, GiftStudioPage, AboutPage, ContactPage, FAQPage, AuthPage, OrdersPage, TrackOrderPage, PolicyPage, NotFound } from '../';
import { AdminAuthProvider } from '../../context';
import { AdminRoute } from '../../components/admin/AdminRoute';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminLoginPage } from '../admin/AdminLoginPage';
import { AdminDashboardPage } from '../admin/AdminDashboardPage';
import { AdminProductsPage } from '../admin/AdminProductsPage';
import { AdminOrdersPage } from '../admin/AdminOrdersPage';
import { AdminCustomersPage } from '../admin/AdminCustomersPage';
import './App.css';

const AppRoutes = () => {
  const routes = useRoutes([
    { path: '/', element: <HomePage /> },
    { path: '/shop', element: <ShopPage /> },
    { path: '/men', element: <ShopPage /> },
    { path: '/women', element: <ShopPage /> },
    { path: '/unisex', element: <ShopPage /> },
    { path: '/best-sellers', element: <ShopPage /> },
    { path: '/product/:slug', element: <ProductPage /> },
    { path: '/cart', element: <CartPage /> },
    { path: '/wishlist', element: <WishlistPage /> },
    { path: '/checkout', element: <CheckoutPage /> },
    { path: '/gift-studio', element: <GiftStudioPage /> },
    { path: '/about', element: <AboutPage /> },
    { path: '/contact', element: <ContactPage /> },
    { path: '/faq', element: <FAQPage /> },
    { path: '/login', element: <AuthPage /> },
    { path: '/register', element: <AuthPage /> },
    { path: '/account', element: <AuthPage /> },
    { path: '/orders', element: <OrdersPage /> },
    { path: '/track-order', element: <TrackOrderPage /> },
    { path: '/privacy', element: <PolicyPage title="Privacy Policy" /> },
    { path: '/terms', element: <PolicyPage title="Terms & Conditions" /> },
    { path: '/shipping', element: <PolicyPage title="Shipping Policy" /> },
    { path: '/returns', element: <PolicyPage title="Return Policy" /> },

    // Admin routes
    { path: '/admin/login', element: <AdminLoginPage /> },
    {
      path: '/admin',
      element: (
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/admin/dashboard" replace /> },
        { path: 'dashboard', element: <AdminDashboardPage /> },
        { path: 'products', element: <AdminProductsPage /> },
        { path: 'orders', element: <AdminOrdersPage /> },
        { path: 'customers', element: <AdminCustomersPage /> },
      ],
    },

    { path: '*', element: <NotFound /> }
  ]);


  return routes;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
    </BrowserRouter>
  );
};