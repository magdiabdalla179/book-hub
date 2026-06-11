import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import CartDrawer from './components/cart/CartDrawer';
import AIChatWidget from './components/ai/AIChatWidget';

// Pages — Customer
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AIChatPage from './pages/AIChatPage';

// Pages — Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Pages — Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBooksPage from './pages/admin/AdminBooksPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';

const CustomerLayout = ({ children }) => (
  <>
    <Navbar />
    <CartDrawer />
    <main className="min-h-screen">{children}</main>
    <Footer />
    <AIChatWidget />
  </>
);

export default function App() {
  const { initTheme } = useThemeStore();
  const { isAuthenticated, isAdmin } = useAuthStore();

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* ========================
            Public / Customer Routes
            ======================== */}
        <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
        <Route path="/books" element={<CustomerLayout><BooksPage /></CustomerLayout>} />
        <Route path="/books/:id" element={<CustomerLayout><BookDetailPage /></CustomerLayout>} />
        <Route path="/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />
        <Route path="/ai-chat" element={<CustomerLayout><AIChatPage /></CustomerLayout>} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CustomerLayout><CheckoutPage /></CustomerLayout>} />
          <Route path="/payment/:orderId" element={<CustomerLayout><PaymentPage /></CustomerLayout>} />
          <Route path="/order-confirmation/:orderId" element={<CustomerLayout><OrderConfirmationPage /></CustomerLayout>} />
          <Route path="/dashboard" element={<CustomerLayout><UserDashboardPage /></CustomerLayout>} />
        </Route>

        {/* ========================
            Auth Routes
            ======================== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* ========================
            Admin Routes
            ======================== */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="books" element={<AdminBooksPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
          </Route>
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
