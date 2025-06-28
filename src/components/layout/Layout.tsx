import React from 'react';
import Sidebar from './Sidebar';
import { useUIStore } from '../../stores/uiStore';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ 
  children
}: LayoutProps) {
  const { setSidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Centered container for entire layout */}
      <div className="max-w-[1200px] mx-auto relative">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="lg:ml-48">
          {/* Mobile header */}
          <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
            <div className="flex items-center justify-between h-16 px-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ET</span>
                </div>
                <span className="ml-3 text-lg font-semibold text-gray-900">
                  ExpenseTracker
                </span>
              </div>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1">
            <div className="max-w-[1100px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 