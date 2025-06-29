import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/Layout';
import { categoryService } from '../../services/categories';
import { transactionService } from '../../services/transactions';
import type { Category } from '../../types';

export default function CategoriesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch spending data for each category (current month)
  const { data: spendingData } = useQuery({
    queryKey: ['category-spending'],
    queryFn: async () => {
      const currentMonth = new Date();
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const transactions = await transactionService.getTransactions({
        start_date: startDate,
        end_date: endDate,
        type: 'expenses',
        per_page: 1000
      });
      
      // Group spending by category
      const categorySpending: Record<number, number> = {};
      transactions.transactions.forEach(transaction => {
        if (transaction.primary_category) {
          const categoryId = transaction.primary_category.id;
          categorySpending[categoryId] = (categorySpending[categoryId] || 0) + Math.abs(transaction.amount);
        }
      });
      
      return categorySpending;
    },
    enabled: !!categoriesData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: {
      name: string;
      color: string;
      description?: string;
      budget_limit?: number;
      parent_category_id?: number;
    }) => categoryService.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCreateForm(false);
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) => 
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateBudgetProgress = (spent: number, budget: number) => {
    if (!budget) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const getBudgetStatus = (spent: number, budget: number) => {
    if (!budget) return 'no-budget';
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return 'over-budget';
    if (percentage >= 80) return 'warning';
    return 'on-track';
  };

  const handleCreateCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createCategoryMutation.mutate({
      name: formData.get('name') as string,
      color: formData.get('color') as string,
      description: formData.get('description') as string || undefined,
      budget_limit: formData.get('budget_limit') ? parseFloat(formData.get('budget_limit') as string) : undefined,
    });
  };

  const handleUpdateBudget = (categoryId: number, budget: number) => {
    updateCategoryMutation.mutate({
      id: categoryId,
      data: { budget_limit: budget }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Categories Header */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">Expense Categories</h2>
              <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                Organize your spending with custom categories and set budgets
              </p>
            </div>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Category
              </span>
            </button>
          </div>
        </div>

        {/* Create Category Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6 transition-colors duration-200">
            <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-4">Create New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="e.g., Coffee & Snacks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    name="color"
                    defaultValue="#3B82F6"
                    className="w-full h-10 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Monthly Budget (Optional)
                  </label>
                  <input
                    type="number"
                    name="budget_limit"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="500.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    name="description"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="Brief description"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-neutral-300 border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        {categoriesLoading ? (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-8 transition-colors duration-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-neutral-400">Loading categories...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-600">
              <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100">Your Categories</h3>
              <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                {categoriesData?.categories.length || 0} categories • Track spending and manage budgets
              </p>
            </div>
            <div className="p-6">
              {!categoriesData?.categories.length ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 dark:text-neutral-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">No Categories Yet</h3>
                  <p className="text-gray-500 dark:text-neutral-400 mb-4">
                    Create your first category to start organizing your expenses
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                  >
                    Create your first category
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoriesData.categories.map((category) => {
                    const spent = spendingData?.[category.id] || 0;
                    const budget = category.budget_limit || 0;
                    const progress = calculateBudgetProgress(spent, budget);
                    const status = getBudgetStatus(spent, budget);

                    return (
                      <div key={category.id} className="border border-gray-200 dark:border-neutral-600 rounded-lg p-4 hover:shadow-sm dark:hover:shadow-lg hover:shadow-gray-200 dark:hover:shadow-neutral-900/50 transition-all duration-200 bg-white dark:bg-neutral-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3"
                              style={{ backgroundColor: category.color }}
                            />
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-neutral-100">{category.name}</h4>
                              {category.description && (
                                <p className="text-xs text-gray-500 dark:text-neutral-400">{category.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="p-1 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this category?')) {
                                  deleteCategoryMutation.mutate(category.id);
                                }
                              }}
                              className="p-1 text-gray-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-neutral-400">Spent this month</span>
                            <span className="font-medium text-gray-900 dark:text-neutral-100">{formatCurrency(spent)}</span>
                          </div>
                          
                          {budget > 0 && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-neutral-400">Budget</span>
                                <span className="font-medium text-gray-900 dark:text-neutral-100">{formatCurrency(budget)}</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-neutral-600 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all ${
                                    status === 'over-budget' ? 'bg-red-500 dark:bg-red-400' :
                                    status === 'warning' ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-green-500 dark:bg-green-400'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className={`${
                                  status === 'over-budget' ? 'text-red-600 dark:text-red-400' :
                                  status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                                }`}>
                                  {progress.toFixed(1)}% used
                                </span>
                                <span className="text-gray-500 dark:text-neutral-400">
                                  {formatCurrency(Math.max(0, budget - spent))} remaining
                                </span>
                              </div>
                            </>
                          )}
                          
                          {budget === 0 && (
                            <button
                              onClick={() => {
                                const newBudget = prompt('Set monthly budget for this category:');
                                if (newBudget && !isNaN(parseFloat(newBudget))) {
                                  handleUpdateBudget(category.id, parseFloat(newBudget));
                                }
                              }}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              + Set Budget
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category Management Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100">Smart Categorization</h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Automatically categorize transactions using AI</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-400">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Machine learning based categorization
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Learn from your manual corrections
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Improve accuracy over time
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 transition-colors duration-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100">Budget Tracking</h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Set and monitor spending limits for each category</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-400">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Monthly and yearly budget limits
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Real-time spending alerts
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Visual progress tracking
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 