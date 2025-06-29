import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/Layout';
import { transactionService } from '../../services/transactions';
import { formatCurrency } from '../../utils/formatters';
import type { TransactionsResponse } from '../../types';

const TRANSACTION_TYPES = ['all', 'expense', 'income'] as const;
const TIME_PERIODS = ['7d', '30d', '90d', 'all'] as const;

type TransactionType = typeof TRANSACTION_TYPES[number];
type TimePeriod = typeof TIME_PERIODS[number];

export default function TransactionsPage() {
  const [filters, setFilters] = useState({
    type: 'all' as TransactionType,
    period: '30d' as TimePeriod,
    search: '',
    category: '',
    showFilters: false,
  });

  const { data: transactionsData, isLoading, error } = useQuery<TransactionsResponse>({
    queryKey: ['transactions', filters.type, filters.period, filters.search, filters.category],
    queryFn: () => transactionService.getTransactions({
      type: filters.type === 'all' ? undefined : filters.type === 'expense' ? 'expenses' : 'income',
      search: filters.search || undefined,
    }),
  });

  const categories = useMemo(() => {
    if (!transactionsData?.transactions) return [];
    const uniqueCategories = [...new Set(transactionsData.transactions
      .map(t => t.primary_category?.name)
      .filter(Boolean)
    )];
    return uniqueCategories.sort();
  }, [transactionsData?.transactions]);

  const getTransactionIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'Food and Drink': '🍽️',
      'Groceries': '🛒',
      'Transportation': '🚗',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Health': '🏥',
      'Travel': '✈️',
      'Bills': '📄',
      'Transfer': '💸',
      'Income': '💰',
      'Investment': '📈',
      'Other': '📌',
    };
    return iconMap[category] || '📌';
  };

  const getPeriodLabel = (period: TimePeriod) => {
    const labels = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days',
      'all': 'All time',
    };
    return labels[period];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">Transactions</h1>
          <p className="text-gray-600 dark:text-neutral-400">View and manage all your transactions</p>
        </div>

        {/* Summary Cards */}
        {transactionsData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Total Income</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(transactionsData.summary.total_income)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(Math.abs(transactionsData.summary.total_expenses))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${transactionsData.summary.net_amount >= 0 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <svg className={`w-6 h-6 ${transactionsData.summary.net_amount >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Net Flow</p>
                  <p className={`text-2xl font-bold ${transactionsData.summary.net_amount >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(transactionsData.summary.net_amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-700 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
                >
                  <FunnelIcon className="w-4 h-4 mr-2" />
                  Filters
                  <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${filters.showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="text-sm text-gray-600 dark:text-neutral-400">
                {transactionsData?.pagination.total_count || 0} transactions found
              </div>
            </div>

            {/* Advanced Filters */}
            {filters.showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-neutral-600">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Transaction Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                      Transaction Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as TransactionType }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="expense">Expenses</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  {/* Time Period */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                      Time Period
                    </label>
                    <select
                      value={filters.period}
                      onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value as TimePeriod }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    >
                      {TIME_PERIODS.map(period => (
                        <option key={period} value={period}>
                          {getPeriodLabel(period)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-neutral-400">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-red-400 dark:text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">Failed to Load Transactions</h3>
              <p className="text-gray-500 dark:text-neutral-400">There was an error loading your transactions. Please try again.</p>
            </div>
          ) : !transactionsData?.transactions.length ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 dark:text-neutral-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">No Transactions Found</h3>
              <p className="text-gray-500 dark:text-neutral-400 mb-4">
                {filters.search || filters.category || filters.type !== 'all' || filters.period !== '30d'
                  ? 'Try adjusting your filters to see more transactions'
                  : 'Connect a bank account to start tracking your transactions automatically'
                }
              </p>
              {(filters.search || filters.category || filters.type !== 'all' || filters.period !== '30d') && (
                <button
                  onClick={() => setFilters({
                    type: 'all',
                    period: '30d',
                    search: '',
                    category: '',
                    showFilters: false,
                  })}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-700/50">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                  <div className="col-span-1 flex items-center justify-center">Type</div>
                  <div className="col-span-3">Merchant</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Account</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200 dark:divide-neutral-700">
                {transactionsData.transactions.map((transaction) => (
                  <div key={transaction.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors items-center">
                    {/* Type Icon */}
                    <div className="col-span-1 flex items-center justify-center">
                      <div className="text-xl">
                        {getTransactionIcon(transaction.primary_category?.name || '')}
                      </div>
                    </div>

                    {/* Merchant */}
                    <div className="col-span-3">
                      <div className="font-medium text-gray-900 dark:text-neutral-100 truncate">
                        {transaction.merchant_name || 'Unknown Merchant'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-neutral-400 truncate">
                        {(transaction.merchant_name && transaction.merchant_name.length > 30) ? transaction.merchant_name : ''}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-200">
                        {transaction.primary_category?.name || 'Uncategorized'}
                      </span>
                    </div>

                    {/* Account */}
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-neutral-100 truncate">
                        {transaction.account.display_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-neutral-400">
                        {transaction.account.account_type || 'Account'}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-900 dark:text-neutral-100">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-neutral-400">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          weekday: 'short'
                        })}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="col-span-2 text-right">
                      <div className={`font-semibold text-sm ${
                        transaction.is_expense ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {transaction.is_expense ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-neutral-400">
                        {transaction.is_expense ? 'Expense' : 'Income'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Info */}
              {transactionsData?.pagination && (
                <div className="border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-700/50 px-6 py-3">
                  <div className="flex items-center justify-between text-sm text-gray-700 dark:text-neutral-300">
                    <div>
                      Showing {transactionsData.transactions.length} of {transactionsData.pagination.total_count} transactions
                    </div>
                    {transactionsData.pagination.total_pages > transactionsData.pagination.current_page && (
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                        Load More
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 