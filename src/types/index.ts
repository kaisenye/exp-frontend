// Base types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: number;
  name: string;
  account_type: string;
  institution_name: string;
  balance_current: number;
  balance_available: number;
  currency: string;
  active: boolean;
  plaid_account_id?: string;
  last_sync_at?: string;
  display_name: string;
  formatted_balance: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  description?: string;
  budget_limit?: number;
  parent_category_id?: number;
  full_name: string;
  child_categories?: Category[];
  transaction_count?: number;
  total_spent?: number;
  budget_utilization?: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  amount: number;
  amount_display: number;
  formatted_amount: string;
  description: string;
  merchant_name?: string;
  date: string;
  currency: string;
  pending: boolean;
  is_expense: boolean;
  is_income: boolean;
  plaid_transaction_id?: string;
  category?: string;
  subcategory?: string;
  account: {
    id: number;
    name: string;
    display_name: string;
    account_type: string;
  };
  primary_category?: {
    id: number;
    name: string;
    color: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface TransactionClassification {
  id: number;
  category: {
    id: number;
    name: string;
    color: string;
    full_name: string;
  };
  confidence_score: number;
  confidence_percentage: number;
  auto_classified: boolean;
  created_at: string;
}

// API Response types
export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface AccountsResponse {
  accounts: Account[];
  summary: {
    total_balance: number;
    total_available: number;
    account_count: number;
  };
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
  summary: {
    total_count: number;
    total_expenses: number;
    total_income: number;
    net_amount: number;
    pending_count: number;
    uncategorized_count: number;
  };
}

export interface CategoriesResponse {
  categories: Category[];
}

// Form types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
}

export interface TransactionFilters {
  page?: number;
  per_page?: number;
  account_id?: number;
  category_id?: number;
  type?: 'expenses' | 'income';
  pending?: boolean;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort?: 'date_asc' | 'date_desc' | 'amount_asc' | 'amount_desc';
}

// UI Component types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type CardVariant = 'default' | 'elevated' | 'bordered' | 'glass';
export type StatusColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

// Plaid types
export interface PlaidLinkTokenResponse {
  link_token: string;
}

export interface PlaidExchangeResponse {
  message: string;
  accounts: Account[];
}

// Error types
export interface APIError {
  message: string;
  code?: string;
  details?: string[];
  field?: string;
}

export interface PlaidError {
  error_type: string;
  error_code: string;
  display_message: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Insights types
export interface Insight {
  id: number;
  insight_type: string;
  title: string;
  description: string;
  data: Record<string, any>;
  severity: 'info' | 'warning' | 'danger';
  created_at: string;
}

export interface SpendingTrend {
  total_spent: number;
  vs_last_period: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface TopCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface InsightsResponse {
  insights: Insight[];
  spending_trends: SpendingTrend;
  top_categories: TopCategory[];
} 