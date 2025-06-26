import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AccountsPage from './pages/accounts/AccountsPage';
import TransactionsPage from './pages/transactions/TransactionsPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import InsightsPage from './pages/insights/InsightsPage';
import NotificationContainer from './components/ui/NotificationContainer';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />;
}

// Loading wrapper to prevent routing decisions during auth initialization
function LoadingAwareRoute({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback: React.ReactNode;
}) {
  const { isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

function App() {
  const { initializeAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes - only redirect if not loading */}
            <Route path="/login" element={
              <LoadingAwareRoute fallback={<div>Loading...</div>}>
                {isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
              </LoadingAwareRoute>
            } />
            <Route path="/register" element={
              <LoadingAwareRoute fallback={<div>Loading...</div>}>
                {isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
              </LoadingAwareRoute>
            } />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <ProtectedRoute>
                  <AccountsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <InsightsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Root redirect - only redirect when not loading */}
            <Route
              path="/"
              element={
                <LoadingAwareRoute fallback={<div>Loading...</div>}>
                  <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
                </LoadingAwareRoute>
              }
            />
            
            {/* Catch all route for 404s - only redirect when not loading */}
            <Route
              path="*"
              element={
                <LoadingAwareRoute fallback={<div>Loading...</div>}>
                  <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
                </LoadingAwareRoute>
              }
            />
          </Routes>
          
          {/* Global Notification Container */}
          <NotificationContainer />
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
