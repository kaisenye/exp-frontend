import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/Layout';
import { transactionService } from '../../services/transactions';
import { accountService } from '../../services/accounts';
import { categoryService } from '../../services/categories';
import type { TransactionFilters } from '../../types';

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    per_page: 20,
    sort: 'date_desc'
  });

  // Fetch transactions with current filters
  const { 
    data: transactionsData, 
    isLoading: transactionsLoading, 
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionService.getTransactions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch accounts for filter dropdown
  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAccounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSync = async () => {
    try {
      await transactionService.syncTransactions();
      refetchTransactions();
    } catch (error) {
      console.error('Failed to sync transactions:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout 
      title="Transactions" 
      subtitle="View and manage your transaction history"
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
              <p className="text-sm text-gray-600 mt-1">
                Filter and search through your transaction history
              </p>
            </div>
            <button
              onClick={handleSync}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Sync Transactions
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Account Filter */}
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.account_id || ''}
              onChange={(e) => handleFilterChange('account_id', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">All Accounts</option>
              {accountsData?.accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.display_name}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.category_id || ''}
              onChange={(e) => handleFilterChange('category_id', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">All Categories</option>
              {categoriesData?.categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.full_name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value as 'expenses' | 'income' | undefined)}
            >
              <option value="">All Types</option>
              <option value="expenses">Expenses</option>
              <option value="income">Income</option>
            </select>

            {/* Search */}
            <input
              type="text"
              placeholder="Search transactions..."
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
            />
          </div>
        </div>

        {/* Summary Stats */}
        {transactionsData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Total Transactions</div>
              <div className="text-2xl font-bold text-gray-900">{transactionsData.summary.total_count}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Total Expenses</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(transactionsData.summary.total_expenses)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Total Income</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(transactionsData.summary.total_income)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Net Amount</div>
              <div className={`text-2xl font-bold ${transactionsData.summary.net_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(transactionsData.summary.net_amount)}
              </div>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Transactions
              {transactionsData?.pagination && (
                <span className="text-sm text-gray-500 ml-2">
                  ({transactionsData.pagination.current_page} of {transactionsData.pagination.total_pages})
                </span>
              )}
            </h3>
          </div>

          {transactionsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : transactionsError ? (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-2">Failed to load transactions</div>
              <button 
                onClick={() => refetchTransactions()}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Try again
              </button>
            </div>
          ) : !transactionsData?.transactions.length ? (
            <div className="p-6">
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                <p className="text-gray-500 mb-4">
                  {Object.keys(filters).length > 3 ? 'Try adjusting your filters' : 'Connect a bank account to start tracking your transactions automatically'}
                </p>
                {Object.keys(filters).length > 3 && (
                  <button
                    onClick={() => setFilters({ page: 1, per_page: 20, sort: 'date_desc' })}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactionsData.transactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.is_expense ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {transaction.is_expense ? '−' : '+'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-medium text-gray-900">
                            {transaction.merchant_name || transaction.description}
                          </div>
                          {transaction.primary_category && (
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: transaction.primary_category.color }}
                                title={transaction.primary_category.full_name}
                              />
                              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                {transaction.primary_category.name}
                              </span>
                            </div>
                          )}
                          {!transaction.primary_category && (
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                              Uncategorized
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {transaction.account.display_name} • {formatDate(transaction.date)}
                          {transaction.pending && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        transaction.is_expense ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.formatted_amount}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {transaction.currency}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {transactionsData?.pagination && transactionsData.pagination.total_pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((transactionsData.pagination.current_page - 1) * transactionsData.pagination.per_page) + 1} to{' '}
                {Math.min(transactionsData.pagination.current_page * transactionsData.pagination.per_page, transactionsData.pagination.total_count)} of{' '}
                {transactionsData.pagination.total_count} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page! - 1))}
                  disabled={transactionsData.pagination.current_page <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleFilterChange('page', Math.min(transactionsData.pagination.total_pages, filters.page! + 1))}
                  disabled={transactionsData.pagination.current_page >= transactionsData.pagination.total_pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 