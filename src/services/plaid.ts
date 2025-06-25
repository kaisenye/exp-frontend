import apiClient from './api';
import type { PlaidLinkTokenResponse, PlaidExchangeResponse } from '../types';

export const plaidService = {
  // Create a link token for Plaid Link
  async createLinkToken(): Promise<PlaidLinkTokenResponse> {
    return apiClient.post<PlaidLinkTokenResponse>('/plaid/create_link_token');
  },

  // Exchange public token for access token
  async exchangePublicToken(publicToken: string): Promise<PlaidExchangeResponse> {
    return apiClient.post<PlaidExchangeResponse>('/plaid/exchange_public_token', {
      public_token: publicToken,
    });
  },

  // Remove a Plaid account
  async removeAccount(accountId: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/plaid/accounts/${accountId}`);
  },
}; 