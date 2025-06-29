import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../ui/Button';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen, theme, toggleTheme } = useUIStore();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
    },
    {
      name: 'Transactions',
      href: '/transactions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      name: 'Insights',
      href: '/insights',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Accounts',
      href: '/accounts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const ThemeToggle = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-full justify-start p-3"
      icon={
        theme === 'light' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )
      }
    >
      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    </Button>
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden dark:bg-neutral-900 dark:bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar - Floating within centered container */}
      <div className={`fixed top-6 left-[10%] z-30 w-56 h-[calc(100vh-3rem)] bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700 hidden lg:flex lg:flex-col shadow-lg dark:shadow-2xl transition-colors duration-200 ${className}`}>
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-100 dark:border-neutral-700">
          <span className="ml-3 text-lg font-semibold text-gray-900 dark:text-neutral-100">
            romo.
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center justify-start px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 group ${
                isActive(item.href)
                  ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <span className={`flex items-center justify-center mr-3 ${isActive(item.href) ? 'text-neutral-900 dark:text-neutral-100' : 'text-gray-400 group-hover:text-gray-500 dark:text-neutral-500 dark:group-hover:text-neutral-300'}`}>
                {item.icon}
              </span>
              <span className="">{item.name}</span>
            </Link>
          ))}
          
          {/* Theme Toggle */}
          <div className="pt-4 border-t border-gray-100 dark:border-neutral-700 mt-4">
            <ThemeToggle />
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-neutral-700">
          <div className="text-xs text-gray-500 dark:text-neutral-400 text-center">
            <p className="font-medium">© 2025 Romo.</p>
            <p className="mt-1">All Rights Reserved.</p>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white dark:bg-neutral-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-neutral-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ET</span>
              </div>
              <span className="ml-3 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                romo.
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                <span className={`mr-3 ${isActive(item.href) ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-neutral-500'}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}
            
            {/* Theme Toggle */}
            <div className="pt-4 border-t border-gray-100 dark:border-neutral-700 mt-4">
              <ThemeToggle />
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
            <div className="text-xs text-gray-500 dark:text-neutral-400">
              <p>© 2025 Romo.</p>
              <p>All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 