import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AccountCard from './AccountCard';
import PlaidLinkButton from '../plaid/PlaidLinkButton';
import { Button } from '../ui/Button';
import { accountService } from '../../services/accounts';
import { plaidService } from '../../services/plaidService';
import { useUIStore } from '../../stores/uiStore';
import type { Account } from '../../types';

interface AccountsListProps {
  className?: string;
}

export default function AccountsList({ className }: AccountsListProps) {
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();

  // Fetch accounts
  const {
    data: accountsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAccounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sync accounts mutation
  const syncAccountsMutation = useMutation({
    mutationFn: () => plaidService.syncAccounts(),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Sync Complete',
        message: 'All accounts have been synchronized.',
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: error.message || 'Failed to sync accounts.',
      });
    },
  });

  // Sync single account mutation
  const syncAccountMutation = useMutation({
    mutationFn: (accountId: number) => plaidService.syncAccount(accountId),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Account Synced',
        message: 'Account has been synchronized.',
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: error.message || 'Failed to sync account.',
      });
    },
  });

  // Disconnect account mutation
  const disconnectAccountMutation = useMutation({
    mutationFn: (accountId: number) => plaidService.disconnectAccount(accountId),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Account Disconnected',
        message: 'Account has been disconnected.',
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Disconnect Failed',
        message: error.message || 'Failed to disconnect account.',
      });
    },
  });

  const handleSyncAccount = (accountId: number) => {
    syncAccountMutation.mutate(accountId);
  };

  const handleDisconnectAccount = (accountId: number) => {
    if (window.confirm('Are you sure you want to disconnect this account?')) {
      disconnectAccountMutation.mutate(accountId);
    }
  };

  const handleSyncAll = () => {
    syncAccountsMutation.mutate();
  };

  const handlePlaidSuccess = () => {
    // Refetch accounts after successful Plaid connection
    refetch();
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Loading skeleton */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-600 mb-4">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load accounts
        </h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <Button onClick={() => refetch()} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  const accounts = accountsData?.accounts || [];

  if (accounts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No accounts connected
        </h3>
        <p className="text-gray-600 mb-6">
          Connect your bank account to start tracking your expenses and income.
        </p>
        <PlaidLinkButton
          variant="primary"
          size="lg"
          onSuccess={handlePlaidSuccess}
        >
          Connect Your First Account
        </PlaidLinkButton>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bank Accounts</h2>
          <p className="text-gray-600">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} connected
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSyncAll}
            loading={syncAccountsMutation.isPending}
            disabled={accounts.length === 0}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            }
          >
            Sync All
          </Button>
          <PlaidLinkButton
            variant="primary"
            onSuccess={handlePlaidSuccess}
          >
            Add Account
          </PlaidLinkButton>
        </div>
      </div>

      {/* Summary */}
      {accountsData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-blue-600 text-sm font-medium">Total Balance</div>
            <div className="text-2xl font-bold text-blue-900">
              ${accountsData.summary.total_balance.toFixed(2)}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-green-600 text-sm font-medium">Available</div>
            <div className="text-2xl font-bold text-green-900">
              ${accountsData.summary.total_available.toFixed(2)}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-purple-600 text-sm font-medium">Accounts</div>
            <div className="text-2xl font-bold text-purple-900">
              {accountsData.summary.account_count}
            </div>
          </div>
        </div>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {accounts.map((account: Account) => (
          <AccountCard
            key={account.id}
            account={account}
            onSync={handleSyncAccount}
            onDisconnect={handleDisconnectAccount}
            isLoading={
              syncAccountMutation.isPending || 
              disconnectAccountMutation.isPending
            }
          />
        ))}
      </div>
    </div>
  );
} 