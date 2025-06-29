import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/Layout';
import { transactionService } from '../../services/transactions';
import { accountService } from '../../services/accounts';

export default function DashboardPage() {
  // Fetch accounts for balance calculation
  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAccounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recent transactions for spending calculation
  const { data: monthlyTransactionsData } = useQuery({
    queryKey: ['monthly-transactions'],
    queryFn: () => {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      return transactionService.getTransactions({
        start_date: startOfMonth.toISOString().split('T')[0],
        end_date: endOfMonth.toISOString().split('T')[0],
        type: 'expenses',
        per_page: 1000
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recent transactions for dashboard display
  const { data: recentTransactionsData, isLoading: recentTransactionsLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => transactionService.getTransactions({ 
      per_page: 5,
      sort: 'date_desc'
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Calculate dashboard stats
  const calculateStats = () => {
    const totalBalance = accountsData?.accounts.reduce((sum, account) => {
      return sum + account.balance_current;
    }, 0) || 0;

    const totalAccounts = accountsData?.accounts.length || 0;

    const monthlySpending = monthlyTransactionsData?.transactions.reduce((sum, transaction) => {
      return sum + Math.abs(transaction.amount);
    }, 0) || 0;

    const lastTransactionDate = recentTransactionsData?.transactions[0]?.date || null;

    return {
      totalBalance,
      totalAccounts,
      monthlySpending,
      lastTransactionDate
    };
  };

  const stats = calculateStats();
  const statsLoading = accountsLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Balance</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                  {statsLoading ? '...' : formatCurrency(stats.totalBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Accounts</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                  {statsLoading ? '...' : stats.totalAccounts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">This Month</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                  {statsLoading ? '...' : formatCurrency(stats.monthlySpending)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Last Transaction</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                  {statsLoading ? '...' : (
                    stats.lastTransactionDate 
                      ? new Date(stats.lastTransactionDate).toLocaleDateString()
                      : 'No transactions'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Accounts Section */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
          <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">Your Accounts</h2>
                <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                  Overview of your connected bank accounts
                </p>
              </div>
              <a 
                href="/accounts" 
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Manage accounts
              </a>
            </div>
          </div>
          <div className="p-6">
            {accountsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Loading accounts...</p>
              </div>
            ) : !accountsData?.accounts.length ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 dark:text-neutral-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-gray-500 dark:text-neutral-400">No accounts connected</p>
                <p className="text-sm text-gray-400 dark:text-neutral-500 mt-1">Connect an account to start tracking your finances</p>
                <a 
                  href="/accounts"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  Connect Account
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accountsData.accounts.slice(0, 4).map((account) => (
                  <div key={account.id} className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:shadow-sm dark:hover:bg-neutral-700/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-neutral-100 text-sm">
                            {account.display_name || account.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-neutral-400">
                            {account.institution_name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold text-sm ${
                          account.balance_current >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(account.balance_current)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-neutral-400 capitalize">
                          {account.account_type}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {accountsData.accounts.length > 4 && (
                  <div className="md:col-span-2">
                    <a 
                      href="/accounts"
                      className="block p-4 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg text-center hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                    >
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        View all {accountsData.accounts.length} accounts →
                      </div>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">Recent Activity</h2>
            <a 
              href="/transactions" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View all
            </a>
          </div>
          
          {recentTransactionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-neutral-400">Loading recent transactions...</p>
            </div>
          ) : !recentTransactionsData?.transactions.length ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 dark:text-neutral-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 dark:text-neutral-400">No recent transactions</p>
              <p className="text-sm text-gray-400 dark:text-neutral-500 mt-1">Connect an account to start tracking your expenses</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactionsData.transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      transaction.is_expense ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }`}>
                      {transaction.is_expense ? '−' : '+'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900 dark:text-neutral-100 text-sm">
                          {transaction.merchant_name || transaction.description}
                        </div>
                        {transaction.primary_category && (
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: transaction.primary_category.color }}
                              title={transaction.primary_category.full_name}
                            />
                            <span className="text-xs text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
                              {transaction.primary_category.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                        {transaction.account.display_name} • {formatDate(transaction.date)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold text-sm ${
                      transaction.is_expense ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {transaction.formatted_amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 