import apiClient from './api';
import type { AccountsResponse, Account } from '../types';

export const accountService = {
  // Get all user accounts
  async getAccounts(): Promise<AccountsResponse> {
    return apiClient.get<AccountsResponse>('/accounts');
  },

  // Get a single account
  async getAccount(id: number): Promise<{ account: Account }> {
    return apiClient.get<{ account: Account }>(`/accounts/${id}`);
  },

  // Sync account transactions
  async syncAccount(id: number): Promise<{ 
    message: string; 
    transactions_created: number; 
    transactions_updated: number; 
    last_sync_at: string 
  }> {
    return apiClient.post(`/accounts/${id}/sync`);
  },
}; 