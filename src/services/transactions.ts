import apiClient from './api';
import type { 
  TransactionsResponse, 
  Transaction, 
  TransactionFilters 
} from '../types';

export const transactionService = {
  // Get transactions with filters and pagination
  async getTransactions(filters: TransactionFilters = {}): Promise<TransactionsResponse> {
    return apiClient.get<TransactionsResponse>('/transactions', filters);
  },

  // Get a single transaction
  async getTransaction(id: number): Promise<{ transaction: Transaction }> {
    return apiClient.get<{ transaction: Transaction }>(`/transactions/${id}`);
  },

  // Sync all transactions
  async syncTransactions(): Promise<{ message: string; transactions_created: number; transactions_updated: number }> {
    return apiClient.post('/transactions/sync');
  },

  // Sync transactions for specific account
  async syncAccountTransactions(accountId: number): Promise<{ message: string; transactions_created: number; transactions_updated: number }> {
    return apiClient.post('/transactions/sync', { account_id: accountId });
  },

  // Categorize a transaction
  async categorizeTransaction(id: number, categoryId: number, confidenceScore = 1.0): Promise<{ message: string }> {
    return apiClient.put(`/transactions/${id}/categorize`, {
      category_id: categoryId,
      confidence_score: confidenceScore,
    });
  },

  // Get uncategorized transactions
  async getUncategorizedTransactions(): Promise<TransactionsResponse> {
    return apiClient.get<TransactionsResponse>('/transactions/uncategorized');
  },

  // Get transactions by category
  async getTransactionsByCategory(categoryId: number): Promise<TransactionsResponse> {
    return apiClient.get<TransactionsResponse>(`/transactions/by_category/${categoryId}`);
  },
}; 