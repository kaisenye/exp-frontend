import axios, { type AxiosInstance, AxiosError } from 'axios';
import type { 
  LoginCredentials, 
  LoginResponse, 
  RegisterData, 
  APIError,
  User
} from '../types';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
    if (this.token) {
      this.setAuthHeader(this.token);
    }

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle 401 unauthorized - token expired
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        
        // Transform error to our standard format
        const errorData = error.response?.data as any;
        const apiError: APIError = {
          message: errorData?.error || error.message || 'An error occurred',
          code: errorData?.code,
          details: errorData?.details,
        };
        
        return Promise.reject(apiError);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    this.setAuthHeader(token);
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }

  private setAuthHeader(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/auth/login', credentials);
    this.setToken(response.token);
    return response;
  }

  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/auth/register', { user: userData });
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.delete('/auth/sessions');
    } finally {
      this.clearToken();
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Get current user (validates token and returns user data)
  async getCurrentUser(): Promise<{ user: User }> {
    return this.get<{ user: User }>('/auth/me');
  }
}

// Create and export a singleton instance
export const apiClient = new APIClient();
export default apiClient; 