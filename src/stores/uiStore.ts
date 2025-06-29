import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Notification } from '../types';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Helper function to get initial theme
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  if (savedTheme) return savedTheme;
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

// Helper function to apply theme to document
const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return;
  
  const root = window.document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  localStorage.setItem('theme', theme);
};

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => {
      const initialTheme = getInitialTheme();
      applyTheme(initialTheme);
      
      return {
        sidebarOpen: false,
        theme: initialTheme,
        notifications: [],

        setSidebarOpen: (open: boolean) => {
          set({ sidebarOpen: open });
        },

        toggleSidebar: () => {
          set((state) => ({ sidebarOpen: !state.sidebarOpen }));
        },

        toggleTheme: () => {
          set((state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
            return { theme: newTheme };
          });
        },

        setTheme: (theme: 'light' | 'dark') => {
          applyTheme(theme);
          set({ theme });
        },

        addNotification: (notification: Omit<Notification, 'id'>) => {
          const id = Math.random().toString(36).substring(2, 9);
          const newNotification: Notification = {
            ...notification,
            id,
            duration: notification.duration || 5000,
          };

          set((state) => ({
            notifications: [...state.notifications, newNotification],
          }));

          // Auto-remove notification after duration
          if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
              get().removeNotification(id);
            }, newNotification.duration);
          }
        },

        removeNotification: (id: string) => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        },

        clearNotifications: () => {
          set({ notifications: [] });
        },
      };
    },
    {
      name: 'ui-store',
    }
  )
); 