import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-h2 font-bold text-neutral-900">ExpenseTracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-600">
                Welcome, {user?.first_name || 'User'}!
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-neutral-200 rounded-lg h-96 flex items-center justify-center bg-white">
            <div className="text-center">
              <h2 className="text-h3 font-semibold text-neutral-900 mb-2">
                Welcome to your Dashboard
              </h2>
              <p className="text-neutral-600">
                Your expense tracking features will be implemented here.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 