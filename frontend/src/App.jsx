import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './admin/AdminPage';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './context/AuthContext';

function GuestRoute({ children }) {
  const { ready, isAuthenticated, isAdmin } = useAuth();
  if (!ready) return <LoadingSpinner />;
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/home'} replace />;
  }
  return children;
}

function CustomerRoute({ children }) {
  const { ready, isAuthenticated, isAdmin } = useAuth();
  if (!ready) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function StoreRoute({ children }) {
  const { ready, isAdmin } = useAuth();
  if (!ready) return <LoadingSpinner />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { ready, isAuthenticated, isAdmin } = useAuth();
  if (!ready) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const { ready, isAdmin } = useAuth();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!ready) {
    return <LoadingSpinner />;
  }

  const showStoreLayout = !isAdminPage;

  return (
    <div className="page-bg relative min-h-screen text-white">
      {showStoreLayout ? <Navbar /> : null}
      <main
        className={
          isAuthPage
            ? 'relative z-10 min-h-[calc(100vh-170px)] p-0'
            : 'relative z-10 mx-auto min-h-[calc(100vh-170px)] max-w-7xl px-4 py-8'
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route
            path="/home"
            element={<HomePage />}
          />
          <Route
            path="/products"
            element={
              <StoreRoute>
                <ProductsPage />
              </StoreRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <StoreRoute>
                <ProductDetailsPage />
              </StoreRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <CustomerRoute>
                <DashboardPage />
              </CustomerRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <CustomerRoute>
                <CartPage />
              </CustomerRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerRoute>
                <CheckoutPage />
              </CustomerRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      {showStoreLayout ? <Footer /> : null}
    </div>
  );
}
