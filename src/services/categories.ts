import apiClient from './api';
import type { CategoriesResponse, Category } from '../types';

export const categoryService = {
  // Get all categories
  async getCategories(): Promise<CategoriesResponse> {
    return apiClient.get<CategoriesResponse>('/categories');
  },

  // Create a new category
  async createCategory(categoryData: {
    name: string;
    color: string;
    description?: string;
    budget_limit?: number;
    parent_category_id?: number;
  }): Promise<{ category: Category }> {
    return apiClient.post<{ category: Category }>('/categories', { category: categoryData });
  },

  // Update a category
  async updateCategory(id: number, categoryData: Partial<{
    name: string;
    color: string;
    description: string;
    budget_limit: number;
    parent_category_id: number;
  }>): Promise<{ category: Category }> {
    return apiClient.put<{ category: Category }>(`/categories/${id}`, { category: categoryData });
  },

  // Delete a category
  async deleteCategory(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/categories/${id}`);
  },
}; 