import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/Layout';
import { transactionService } from '../../services/transactions';
import { accountService } from '../../services/accounts';
import { categoryService } from '../../services/categories';
import { 
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Calculate date range
  const getDateRange = (range: string) => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  };

  const { start_date, end_date } = getDateRange(timeRange);

  // Fetch transactions for analysis
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['insights-transactions', timeRange],
    queryFn: () => transactionService.getTransactions({
      start_date,
      end_date,
      per_page: 1000
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch accounts
  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAccounts(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Calculate insights
  const calculateInsights = () => {
    if (!transactionsData?.transactions.length) {
      return {
        totalSpent: 0,
        totalIncome: 0,
        savingsRate: 0,
        avgDailySpend: 0,
        topCategory: null,
        categoryBreakdown: [],
        monthlyComparison: 0,
        budgetStatus: 'on-track' as const
      };
    }

    const transactions = transactionsData.transactions;
    const expenses = transactions.filter(t => t.is_expense);
    const income = transactions.filter(t => t.is_income);

    const totalSpent = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

    // Calculate average daily spend
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const avgDailySpend = totalSpent / days;

    // Category breakdown
    const categorySpending: Record<string, { amount: number; color: string; count: number }> = {};
    
    expenses.forEach(transaction => {
      if (transaction.primary_category) {
        const categoryName = transaction.primary_category.name;
        if (!categorySpending[categoryName]) {
          categorySpending[categoryName] = {
            amount: 0,
            color: transaction.primary_category.color,
            count: 0
          };
        }
        categorySpending[categoryName].amount += Math.abs(transaction.amount);
        categorySpending[categoryName].count += 1;
      }
    });

    const categoryBreakdown = Object.entries(categorySpending)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
        color: data.color,
        count: data.count
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    const topCategory = categoryBreakdown[0] || null;

    // Simple monthly comparison (compare with previous period)
    const monthlyComparison = Math.random() * 20 - 10; // Placeholder for now

    return {
      totalSpent,
      totalIncome,
      savingsRate,
      avgDailySpend,
      topCategory,
      categoryBreakdown,
      monthlyComparison,
      budgetStatus: savingsRate > 20 ? 'excellent' : savingsRate > 10 ? 'good' : savingsRate > 0 ? 'on-track' : 'over-budget'
    };
  };

  const insights = calculateInsights();

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'on-track':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'over-budget':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-neutral-400';
    }
  };

  const getBudgetStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return '🎉';
      case 'good':
        return '✅';
      case 'on-track':
        return '⚠️';
      case 'over-budget':
        return '🚨';
      default:
        return '📊';
    }
  };

  const getTimeRangeLabel = (range: '7d' | '30d' | '90d' | '1y') => {
    const labels = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days',
      '1y': 'Last year',
    };
    return labels[range];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">Financial Insights</h1>
            <p className="text-gray-600 dark:text-neutral-400">Understand your spending patterns and trends</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
              className="px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            >
              {['7d', '30d', '90d', '1y'].map(range => (
                <option key={range} value={range}>
                  {getTimeRangeLabel(range as '7d' | '30d' | '90d' | '1y')}
                </option>
              ))}
            </select>
            {/* <button className="flex items-center px-4 py-2 text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-700 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors">
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button> */}
          </div>
        </div>

        {transactionsLoading ? (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-8 transition-colors duration-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-neutral-400">Loading insights...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Savings Rate</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-neutral-100">{insights.savingsRate.toFixed(1)}%</p>
                    <p className={`text-xs ${insights.savingsRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {insights.savingsRate >= 20 ? 'Excellent!' : insights.savingsRate >= 10 ? 'Good progress' : insights.savingsRate >= 0 ? 'On track' : 'Needs attention'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Top Category</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-neutral-100">
                      {insights.topCategory?.name || 'No data'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      {insights.topCategory ? formatCurrency(insights.topCategory.amount) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Avg Daily Spend</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-neutral-100">{formatCurrency(insights.avgDailySpend)}</p>
                    <p className={`text-xs ${insights.monthlyComparison >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {formatPercentage(insights.monthlyComparison)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <span className="text-xl">{getBudgetStatusIcon(insights.budgetStatus)}</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Budget Status</p>
                    <p className={`text-lg font-bold capitalize ${getBudgetStatusColor(insights.budgetStatus)}`}>
                      {insights.budgetStatus.replace('-', ' ')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      {insights.totalSpent > 0 ? formatCurrency(insights.totalSpent) + ' spent' : 'No spending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
                <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-4">Category Breakdown</h3>
                {insights.categoryBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {insights.categoryBreakdown.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-neutral-100">{category.name}</p>
                            <p className="text-sm text-gray-500 dark:text-neutral-400">{category.count} transactions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-neutral-100">{formatCurrency(category.amount)}</p>
                          <p className="text-sm text-gray-500 dark:text-neutral-400">{category.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 dark:text-neutral-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-neutral-400">No spending data available for this period</p>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
                <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-4">Financial Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-400">Total Income</p>
                      <p className="text-xl font-bold text-green-900 dark:text-green-300">{formatCurrency(insights.totalIncome)}</p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-400">Total Expenses</p>
                      <p className="text-xl font-bold text-red-900 dark:text-red-300">{formatCurrency(insights.totalSpent)}</p>
                    </div>
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-400">Net Amount</p>
                      <p className={`text-xl font-bold ${insights.totalIncome - insights.totalSpent >= 0 ? 'text-blue-900 dark:text-blue-300' : 'text-red-900 dark:text-red-300'}`}>
                        {formatCurrency(insights.totalIncome - insights.totalSpent)}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights and Recommendations */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-4">Smart Insights & Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.savingsRate < 10 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Improve Your Savings Rate</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Your current savings rate is {insights.savingsRate.toFixed(1)}%. Consider reducing spending in your top categories to reach the recommended 20% savings rate.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {insights.topCategory && insights.topCategory.percentage > 40 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">High Spending Alert</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {insights.topCategory.name} represents {insights.topCategory.percentage.toFixed(1)}% of your spending. Consider setting a budget for this category.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {insights.avgDailySpend > 100 && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-purple-800 dark:text-purple-400">Daily Spending Tracking</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          Your average daily spend is {formatCurrency(insights.avgDailySpend)}. Try tracking daily expenses to identify areas for improvement.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {insights.savingsRate >= 20 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-400">Excellent Financial Health!</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Your {insights.savingsRate.toFixed(1)}% savings rate is excellent! Consider investing the excess for long-term growth.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Categories */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-neutral-100">Top Spending Categories</h2>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">Where your money is going</p>
                </div>
              </div>

              <div className="space-y-4">
                {insights.categoryBreakdown.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium" style={{ backgroundColor: category.color }}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-neutral-100">{category.name}</div>
                        <div className="text-sm text-gray-600 dark:text-neutral-400">{category.percentage.toFixed(1)}% of spending</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-neutral-100">{formatCurrency(category.amount)}</div>
                      <div className="w-24 bg-gray-200 dark:bg-neutral-600 rounded-full h-2 mt-1">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${category.percentage}%`, 
                            backgroundColor: category.color 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Health Score */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 transition-colors duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-medium text-blue-900 dark:text-blue-100">Financial Health Insights</h2>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-3"></div>
                      <span className="text-sm text-blue-800 dark:text-blue-200">
                        You're saving 25% of your income on average
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full mr-3"></div>
                      <span className="text-sm text-blue-800 dark:text-blue-200">
                        Food & Dining is your largest expense category
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3"></div>
                      <span className="text-sm text-blue-800 dark:text-blue-200">
                        Your spending has increased 15% compared to last period
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">8.5</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Health Score</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Out of 10</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 