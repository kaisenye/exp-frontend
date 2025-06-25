import { apiClient } from './api';
import type { PlaidLinkTokenResponse, PlaidExchangeResponse, PlaidError } from '../types';

export class PlaidService {
  /**
   * Create a link token for Plaid Link initialization
   */
  async createLinkToken(): Promise<string> {
    try {
      const response = await apiClient.post<PlaidLinkTokenResponse>('/plaid/link_token');
      return response.link_token;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create Plaid link token');
    }
  }

  /**
   * Exchange public token for access token and fetch accounts
   */
  async exchangePublicToken(publicToken: string): Promise<PlaidExchangeResponse> {
    try {
      const response = await apiClient.post<PlaidExchangeResponse>('/plaid/exchange_token', {
        public_token: publicToken,
      });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to exchange Plaid token');
    }
  }

  /**
   * Manually sync all connected accounts
   */
  async syncAccounts(): Promise<void> {
    try {
      await apiClient.post('/plaid/sync_all_accounts');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sync accounts');
    }
  }

  /**
   * Sync specific account by ID
   */
  async syncAccount(accountId: number): Promise<void> {
    try {
      await apiClient.post(`/plaid/sync/${accountId}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sync account');
    }
  }

  /**
   * Remove Plaid connection for an account
   */
  async disconnectAccount(accountId: number): Promise<void> {
    try {
      await apiClient.delete(`/plaid/accounts/${accountId}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to disconnect account');
    }
  }

  /**
   * Get Plaid account connection status
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    accounts_count: number;
    last_sync: string | null;
  }> {
    try {
      const response = await apiClient.get<{
        connected: boolean;
        accounts_count: number;
        last_sync: string | null;
      }>('/plaid/status');
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get connection status');
    }
  }

  /**
   * Handle Plaid error and return user-friendly message
   */
  static handlePlaidError(error: PlaidError): string {
    const errorMessages: Record<string, string> = {
      ITEM_LOGIN_REQUIRED: 'Please reconnect your bank account. Your login credentials may have changed.',
      INVALID_CREDENTIALS: 'Invalid bank credentials. Please check your login information.',
      INVALID_MFA: 'Invalid verification code. Please try again.',
      ITEM_LOCKED: 'Your account is temporarily locked. Please contact your bank.',
      ITEM_NOT_SUPPORTED: 'This bank is not currently supported.',
      INSUFFICIENT_CREDENTIALS: 'Additional information required. Please complete the connection process.',
      INVALID_SEND_METHOD: 'Invalid verification method selected.',
      RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
      INSTITUTION_DOWN: 'Your bank is temporarily unavailable. Please try again later.',
      INSTITUTION_NOT_RESPONDING: 'Your bank is not responding. Please try again later.',
    };

    return errorMessages[error.error_code] || error.display_message || 'An unexpected error occurred.';
  }
}

export const plaidService = new PlaidService(); 