// src/App.tsx
// Root component — wraps providers and defines all routes

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Spinner } from './components/ui/index';
import { SuccessPage, CancelPage } from './pages/StatusPages';

// Lazy-loaded pages for code splitting
const Home           = lazy(() => import('./pages/Home/Home'));
const Market         = lazy(() => import('./pages/Market/Market'));
const Cart           = lazy(() => import('./pages/Cart/Cart'));
const Checkout       = lazy(() => import('./pages/Checkout/Checkout'));
const ProductDetails = lazy(() => import('./pages/ProductDetails/ProductDetails'));
const Login          = lazy(() => import('./pages/Auth/Login'));
const Signup         = lazy(() => import('./pages/Auth/Signup'));
const Dashboard      = lazy(() => import('./pages/Dashboard/Dashboard'));
const Admin          = lazy(() => import('./pages/Admin/Admin'));
const LeaveReview    = lazy(() => import('./pages/Review/LeaveReview'));
const FAQ            = lazy(() => import('./pages/FAQ/FAQ'));

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <Spinner size="lg" />
  </div>
);

const AppRoutes: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <div className="flex-1">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                    element={<Home />} />
          <Route path="/market"              element={<Market />} />
          <Route path="/product/:id"         element={<ProductDetails />} />
          <Route path="/cart"                element={<Cart />} />
          <Route path="/faqs"                element={<FAQ />} />
          <Route path="/login"               element={<Login />} />
          <Route path="/signup"              element={<Signup />} />
          <Route path="/success"             element={<SuccessPage />} />
          <Route path="/cancel"              element={<CancelPage />} />

          <Route path="/checkout" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/products/:id/review" element={
            <ProtectedRoute><LeaveReview /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
    <Footer />
  </div>
);

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
