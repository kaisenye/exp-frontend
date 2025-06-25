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
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      sidebarOpen: false,
      theme: 'light',
      notifications: [],

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      toggleTheme: () => {
        set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        }));
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
    }),
    {
      name: 'ui-store',
    }
  )
); 