import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/Layout';
import { accountService } from '../../services/accounts';
import { plaidService } from '../../services/plaidService';

export default function AccountsPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch accounts
  const { data: accountsData, isLoading: accountsLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAccounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create link token mutation
  const createLinkTokenMutation = useMutation({
    mutationFn: () => plaidService.createLinkToken(),
    onSuccess: (linkToken) => {
      // Initialize Plaid Link with the token
      initializePlaidLink(linkToken);
    },
    onError: (error) => {
      console.error('Failed to create link token:', error);
      alert('Failed to initialize account connection. Please try again.');
    },
  });

  // Sync accounts mutation
  const syncAccountsMutation = useMutation({
    mutationFn: () => plaidService.syncAccounts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  // Disconnect account mutation
  const disconnectAccountMutation = useMutation({
    mutationFn: (accountId: number) => plaidService.disconnectAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      alert('Account disconnection is not yet implemented in the backend.');
    },
  });

  const initializePlaidLink = (linkToken: string) => {
    // This would typically use the Plaid Link SDK
    // For now, we'll simulate the process
    console.log('Initializing Plaid Link with token:', linkToken);
    
    // Simulate successful account connection
    setTimeout(() => {
      setIsConnecting(false);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      alert('Account connected successfully! Syncing your data...');
    }, 2000);
  };

  const handleConnectAccount = () => {
    setIsConnecting(true);
    createLinkTokenMutation.mutate();
  };

  const handleSyncAccounts = () => {
    syncAccountsMutation.mutate();
  };

  const handleDisconnectAccount = (accountId: number, accountName: string) => {
    if (confirm(`Are you sure you want to disconnect ${accountName}? This will remove all associated transactions.`)) {
      disconnectAccountMutation.mutate(accountId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return '🏦';
      case 'savings':
        return '💰';
      case 'credit':
        return '💳';
      case 'investment':
        return '📈';
      default:
        return '🏛️';
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'savings':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'credit':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'investment':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300';
    }
  };

  const totalBalance = accountsData?.accounts.reduce((sum, account) => {
    // Only include positive balances for net worth calculation
    return sum + (account.balance_current > 0 ? account.balance_current : 0);
  }, 0) || 0;

  const totalDebt = accountsData?.accounts.reduce((sum, account) => {
    // Include negative balances (debt) for credit cards, etc.
    return sum + (account.balance_current < 0 ? Math.abs(account.balance_current) : 0);
  }, 0) || 0;

  return (
    <DashboardLayout 
      // title="Accounts" 
      // subtitle="Manage your connected bank accounts and financial institutions"
    >
      <div className="space-y-6">
        {/* Account Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{formatCurrency(totalBalance)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Connected Accounts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{accountsData?.accounts.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Total Debt</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{formatCurrency(totalDebt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Management Header */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">Connected Bank Accounts</h2>
              <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                Securely connect your bank accounts to track transactions and balances
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleSyncAccounts}
                disabled={syncAccountsMutation.isPending || !accountsData?.accounts.length}
                className="px-4 py-2 text-gray-700 dark:text-neutral-300 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="flex items-center">
                  <svg className={`w-4 h-4 mr-2 ${syncAccountsMutation.isPending ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {syncAccountsMutation.isPending ? 'Syncing...' : 'Sync All'}
                </span>
              </button>
              <button 
                onClick={handleConnectAccount}
                disabled={isConnecting || createLinkTokenMutation.isPending}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {isConnecting || createLinkTokenMutation.isPending ? 'Connecting...' : 'Add Account'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Accounts List */}
        {accountsLoading ? (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-8 transition-colors duration-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-neutral-400">Loading your accounts...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-8 transition-colors duration-200">
            <div className="text-center">
              <svg className="w-16 h-16 text-red-400 dark:text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">Failed to Load Accounts</h3>
              <p className="text-gray-500 dark:text-neutral-400 mb-4">
                There was an error loading your accounts. Please try again.
              </p>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['accounts'] })}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Retry
              </button>
            </div>
          </div>
        ) : !accountsData?.accounts.length ? (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-8 transition-colors duration-200">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 dark:text-neutral-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">No Accounts Connected</h3>
              <p className="text-gray-500 dark:text-neutral-400 mb-4">
                Connect your first bank account to start tracking your finances
              </p>
              <button
                onClick={handleConnectAccount}
                disabled={isConnecting || createLinkTokenMutation.isPending}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
              >
                {isConnecting || createLinkTokenMutation.isPending ? 'Connecting...' : 'Connect Your First Account'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accountsData.accounts.map((account) => (
                  <div key={account.id} className="border border-gray-200 dark:border-neutral-600 rounded-lg p-4 hover:shadow-sm dark:hover:bg-neutral-700/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getAccountTypeIcon(account.account_type)}</span>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-neutral-100">{account.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-neutral-400">{account.institution_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.account_type)}`}>
                          {account.account_type}
                        </span>
                        <button
                          onClick={() => handleDisconnectAccount(account.id, account.name)}
                          className="p-1 text-gray-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400"
                          title="Disconnect account"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-neutral-400">Current Balance</span>
                        <span className={`text-lg font-semibold ${account.balance_current >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(account.balance_current)}
                        </span>
                      </div>
                      
                      {account.balance_available !== null && account.balance_available !== account.balance_current && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-neutral-400">Available Balance</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-neutral-100">
                            {formatCurrency(account.balance_available)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-neutral-500">
                        <span>Account: {account.display_name}</span>
                        <span>Last updated: {new Date(account.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100">Bank-Level Security</h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Your data is protected with 256-bit encryption</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-400">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Read-only access to your accounts
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                We never store your banking credentials
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                SOC 2 Type II certified infrastructure
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100">Account Management</h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Full control over your connected accounts</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-400">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Disconnect accounts anytime
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Manual sync for latest data
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Automatic balance updates
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 