import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function Layout({ 
  children, 
  title = 'Dashboard',
  subtitle 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="pt-24">
        {/* Page content */}
        <main className="py-6">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 