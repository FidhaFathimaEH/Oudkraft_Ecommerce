import { useRoutes, BrowserRouter } from 'react-router-dom';
import { HomePage, ShopPage, ProductPage, CartPage, WishlistPage, CheckoutPage, GiftStudioPage, AboutPage, ContactPage, FAQPage, AuthPage, OrdersPage, TrackOrderPage, PolicyPage, NotFound } from '../';
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
    { path: '*', element: <NotFound /> }
  ]);

  return routes;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};