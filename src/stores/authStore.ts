import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import apiClient from '../services/api';
import type { User, LoginCredentials, RegisterData } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
  checkAuthStatus: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.login(credentials);
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Login failed', 
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.register(userData);
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Registration failed', 
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      logout: () => {
        apiClient.logout();
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null,
          isLoading: false
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false
        });
      },

      checkAuthStatus: async () => {
        if (!apiClient.isAuthenticated()) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        try {
          const response = await apiClient.getCurrentUser();
          set({ 
            user: response.user, 
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          // Token is invalid or expired
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        await get().checkAuthStatus();
      },
    }),
    {
      name: 'auth-store',
    }
  )
); 