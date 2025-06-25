# 🚀 ExpenseTracker Backend API Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Core Data Models](#core-data-models)
- [API Endpoints](#api-endpoints)
- [Plaid Integration](#plaid-integration)
- [Transaction Categorization](#transaction-categorization)
- [Insights & Analytics](#insights--analytics)
- [Error Handling](#error-handling)
- [Rate Limiting & Performance](#rate-limiting--performance)
- [Frontend Integration Examples](#frontend-integration-examples)

---

## 🎯 Overview

**ExpenseTracker Backend** is a complete financial management API built with Ruby on Rails. It provides:

- ✅ **User Authentication** (JWT-based)
- ✅ **Bank Account Integration** (Plaid API)
- ✅ **Transaction Management** with auto-categorization
- ✅ **Budget Tracking** with hierarchical categories
- ✅ **Financial Insights** and analytics
- ✅ **Real-time Sync** with bank accounts

**Base URL:** `https://your-domain.com/api/v1`
**API Version:** v1
**Authentication:** JWT Bearer tokens

---

## 🔐 Authentication

### Registration
```http
POST /api/v1/auth/registrations
Content-Type: application/json

{
  "user": {
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Login
```http
POST /api/v1/auth/sessions
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Logout
```http
DELETE /api/v1/auth/sessions
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Authentication Headers
All protected endpoints require:
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📊 Core Data Models

### User
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "admin": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Account
```json
{
  "id": 1,
  "name": "Chase Checking",
  "account_type": "checking",
  "institution_name": "Chase Bank",
  "balance_current": 2500.50,
  "balance_available": 2300.50,
  "currency": "USD",
  "active": true,
  "plaid_account_id": "plaid_account_123",
  "last_sync_at": "2024-01-01T12:00:00.000Z",
  "display_name": "Chase Bank - Chase Checking",
  "formatted_balance": "$2,500.50",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Transaction
```json
{
  "id": 1,
  "amount": -45.67,
  "amount_display": 45.67,
  "formatted_amount": "-$45.67",
  "description": "STARBUCKS COFFEE #123",
  "merchant_name": "Starbucks",
  "date": "2024-01-01",
  "currency": "USD",
  "pending": false,
  "is_expense": true,
  "is_income": false,
  "plaid_transaction_id": "plaid_tx_123",
  "category": "Food and Drink",
  "subcategory": "Coffee Shop",
  "account": {
    "id": 1,
    "name": "Chase Checking",
    "display_name": "Chase Bank - Chase Checking",
    "account_type": "checking"
  },
  "primary_category": {
    "id": 5,
    "name": "Coffee",
    "color": "#8B4513",
    "full_name": "Food & Dining > Coffee"
  },
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Category
```json
{
  "id": 1,
  "name": "Food & Dining",
  "color": "#FF6B6B",
  "description": "All food and dining expenses",
  "budget_limit": 500.00,
  "parent_category_id": null,
  "full_name": "Food & Dining",
  "child_categories": [
    {
      "id": 2,
      "name": "Coffee",
      "color": "#8B4513",
      "full_name": "Food & Dining > Coffee"
    }
  ],
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Transaction Classification
```json
{
  "id": 1,
  "category": {
    "id": 2,
    "name": "Coffee",
    "color": "#8B4513",
    "full_name": "Food & Dining > Coffee"
  },
  "confidence_score": 0.95,
  "confidence_percentage": 95.0,
  "auto_classified": true,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 🛠 API Endpoints

### 👤 Users

#### Get Current User Profile
```http
GET /api/v1/users/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update User Profile
```http
PUT /api/v1/users/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "user": {
    "first_name": "John",
    "last_name": "Smith"
  }
}
```

### 🏦 Accounts

#### List User's Accounts
```http
GET /api/v1/accounts
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "accounts": [
    {
      "id": 1,
      "name": "Chase Checking",
      "account_type": "checking",
      "institution_name": "Chase Bank",
      "balance_current": 2500.50,
      "balance_available": 2300.50,
      "currency": "USD",
      "active": true,
      "display_name": "Chase Bank - Chase Checking",
      "formatted_balance": "$2,500.50",
      "last_sync_at": "2024-01-01T12:00:00.000Z"
    }
  ],
  "summary": {
    "total_balance": 2500.50,
    "total_available": 2300.50,
    "account_count": 1
  }
}
```

#### Get Single Account
```http
GET /api/v1/accounts/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Sync Account Transactions
```http
POST /api/v1/accounts/:id/sync
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "message": "Account synced successfully",
  "transactions_created": 5,
  "transactions_updated": 2,
  "last_sync_at": "2024-01-01T12:00:00.000Z"
}
```

### 💳 Transactions

#### List Transactions (with filtering & pagination)
```http
GET /api/v1/transactions?page=1&per_page=20&account_id=1&category_id=2&type=expenses&start_date=2024-01-01&end_date=2024-01-31&search=coffee&sort=date_desc
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `per_page` (int): Items per page (default: 20, max: 100)
- `account_id` (int): Filter by account
- `category_id` (int): Filter by category
- `type` (string): `expenses` or `income`
- `pending` (boolean): Filter by pending status
- `start_date` (date): Start date (YYYY-MM-DD)
- `end_date` (date): End date (YYYY-MM-DD)
- `search` (string): Search in description/merchant
- `sort` (string): `date_asc`, `date_desc`, `amount_asc`, `amount_desc`

**Response:**
```json
{
  "transactions": [
    {
      "id": 1,
      "amount": -45.67,
      "formatted_amount": "-$45.67",
      "description": "STARBUCKS COFFEE #123",
      "merchant_name": "Starbucks",
      "date": "2024-01-01",
      "pending": false,
      "is_expense": true,
      "account": {
        "id": 1,
        "name": "Chase Checking",
        "display_name": "Chase Bank - Chase Checking"
      },
      "primary_category": {
        "id": 2,
        "name": "Coffee",
        "color": "#8B4513",
        "full_name": "Food & Dining > Coffee"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_count": 150,
    "total_pages": 8
  },
  "summary": {
    "total_count": 150,
    "total_expenses": -1234.56,
    "total_income": 2500.00,
    "net_amount": 1265.44,
    "pending_count": 3,
    "uncategorized_count": 12
  }
}
```

#### Get Single Transaction
```http
GET /api/v1/transactions/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Sync All Transactions
```http
POST /api/v1/transactions/sync
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Sync Specific Account
```http
POST /api/v1/transactions/sync?account_id=1
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Categorize Transaction
```http
PUT /api/v1/transactions/:id/categorize
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "category_id": 2,
  "confidence_score": 1.0
}
```

#### Get Uncategorized Transactions
```http
GET /api/v1/transactions/uncategorized
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Transactions by Category
```http
GET /api/v1/transactions/by_category/:category_id
Authorization: Bearer YOUR_JWT_TOKEN
```

### 📂 Categories

#### List Categories
```http
GET /api/v1/categories
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Food & Dining",
      "color": "#FF6B6B",
      "description": "All food and dining expenses",
      "budget_limit": 500.00,
      "parent_category_id": null,
      "full_name": "Food & Dining",
      "child_categories": [
        {
          "id": 2,
          "name": "Coffee",
          "color": "#8B4513",
          "full_name": "Food & Dining > Coffee"
        }
      ],
      "transaction_count": 45,
      "total_spent": 234.56,
      "budget_utilization": 46.9
    }
  ]
}
```

#### Create Category
```http
POST /api/v1/categories
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "category": {
    "name": "Groceries",
    "color": "#4CAF50",
    "description": "Grocery shopping",
    "budget_limit": 400.00,
    "parent_category_id": 1
  }
}
```

#### Update Category
```http
PUT /api/v1/categories/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "category": {
    "budget_limit": 600.00
  }
}
```

#### Delete Category
```http
DELETE /api/v1/categories/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### 📈 Insights

#### Get Financial Insights
```http
GET /api/v1/insights?period=monthly&start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `period` (string): `weekly`, `monthly`, `yearly`
- `start_date` (date): Start date (YYYY-MM-DD)
- `end_date` (date): End date (YYYY-MM-DD)
- `category_id` (int): Filter by category

**Response:**
```json
{
  "insights": [
    {
      "id": 1,
      "insight_type": "budget_alert",
      "title": "Budget Alert: Food & Dining",
      "description": "You've spent 89% of your Food & Dining budget this month",
      "data": {
        "category": "Food & Dining",
        "spent": 445.67,
        "budget": 500.00,
        "percentage": 89.1
      },
      "severity": "warning",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "spending_trends": {
    "total_spent": 1234.56,
    "vs_last_period": 15.2,
    "trend": "increasing"
  },
  "top_categories": [
    {
      "category": "Food & Dining",
      "amount": 445.67,
      "percentage": 36.1
    }
  ]
}
```

#### Get Spending Analytics
```http
GET /api/v1/insights/spending?period=monthly&group_by=category
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Budget Status
```http
GET /api/v1/insights/budget_status
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔗 Plaid Integration

### Create Link Token
```http
POST /api/v1/plaid/create_link_token
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "link_token": "link-sandbox-12345678-1234-1234-1234-123456789012"
}
```

### Exchange Public Token
```http
POST /api/v1/plaid/exchange_public_token
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "public_token": "public-sandbox-12345678-1234-1234-1234-123456789012"
}
```

**Response:**
```json
{
  "message": "Account linked successfully",
  "accounts": [
    {
      "id": 1,
      "name": "Chase Checking",
      "account_type": "checking",
      "institution_name": "Chase Bank",
      "balance_current": 2500.50,
      "plaid_account_id": "plaid_account_123"
    }
  ]
}
```

### Remove Plaid Account
```http
DELETE /api/v1/plaid/accounts/:account_id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Plaid Webhook Endpoint
```http
POST /api/v1/plaid/webhook
Content-Type: application/json

{
  "webhook_type": "TRANSACTIONS",
  "webhook_code": "SYNC_UPDATES_AVAILABLE",
  "item_id": "plaid_item_123",
  "environment": "sandbox"
}
```

---

## 🎯 Transaction Categorization

### Auto-Classification System

The backend automatically categorizes transactions using a **4-tier priority system**:

1. **Plaid Subcategory Match** (95% confidence)
   - Maps "Coffee Shop" → "Coffee" category
   
2. **Plaid Category Match** (90% confidence)
   - Maps "Food and Drink" → "Food & Dining" category
   
3. **Enhanced Keyword Matching** (75-85% confidence)
   - Uses Plaid data to improve keyword detection
   
4. **Auto-Create from Plaid** (90% confidence)
   - Creates new categories like "Fast Food" under "Food & Dining"

### Manual Categorization
Users can manually categorize any transaction, which:
- Overrides auto-classification
- Sets confidence to 100%
- Marks as user-confirmed

### Category Creation
The system can auto-create categories for common Plaid categories:
- ✅ Coffee Shop → Creates "Coffee" under "Food & Dining"
- ✅ Gas Stations → Creates "Gas Stations" under "Transportation"
- ✅ Department Stores → Creates "Shopping" category
- ✅ Movie Theaters → Creates "Entertainment" category

---

## 🔍 Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "details": ["Specific error details"],
  "status": 400
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### Plaid-Specific Errors
```json
{
  "error": "Plaid API Error",
  "plaid_error": {
    "error_type": "ITEM_ERROR",
    "error_code": "ITEM_LOGIN_REQUIRED",
    "display_message": "The login details of this item have changed."
  }
}
```

---

## ⚡ Rate Limiting & Performance

### Rate Limits
- **General API**: 1000 requests/hour per user
- **Plaid Operations**: 100 requests/hour per user
- **Bulk Operations**: 10 requests/minute per user

### Pagination
- Default: 20 items per page
- Maximum: 100 items per page
- Use `page` and `per_page` parameters

### Caching
- Account balances: 5 minutes
- Transaction lists: 2 minutes
- Categories: 1 hour

---

## 🌐 Frontend Integration Examples

### React/TypeScript Example

```typescript
// API Client Setup
class ExpenseTrackerAPI {
  private baseURL = 'https://your-domain.com/api/v1';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request('/auth/sessions', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  // Transactions
  async getTransactions(params: TransactionParams = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/transactions?${queryString}`);
  }

  async categorizeTransaction(id: number, categoryId: number) {
    return this.request(`/transactions/${id}/categorize`, {
      method: 'PUT',
      body: JSON.stringify({ category_id: categoryId }),
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  // Plaid
  async createLinkToken() {
    return this.request('/plaid/create_link_token', { method: 'POST' });
  }

  async exchangePublicToken(publicToken: string) {
    return this.request('/plaid/exchange_public_token', {
      method: 'POST',
      body: JSON.stringify({ public_token: publicToken }),
    });
  }
}

// Usage Example
const api = new ExpenseTrackerAPI();

// Login
const { token, user } = await api.login('user@example.com', 'password');

// Get transactions with filters
const transactions = await api.getTransactions({
  page: 1,
  per_page: 20,
  type: 'expenses',
  start_date: '2024-01-01',
  end_date: '2024-01-31',
});

// Categorize transaction
await api.categorizeTransaction(123, 5);
```

### Vue.js Example

```javascript
// Composable for transaction management
import { ref, reactive } from 'vue';

export function useTransactions() {
  const transactions = ref([]);
  const loading = ref(false);
  const pagination = reactive({
    currentPage: 1,
    perPage: 20,
    totalCount: 0,
    totalPages: 0,
  });

  const fetchTransactions = async (filters = {}) => {
    loading.value = true;
    try {
      const response = await api.getTransactions({
        page: pagination.currentPage,
        per_page: pagination.perPage,
        ...filters,
      });
      
      transactions.value = response.transactions;
      Object.assign(pagination, response.pagination);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      loading.value = false;
    }
  };

  const categorizeTransaction = async (transactionId, categoryId) => {
    try {
      await api.categorizeTransaction(transactionId, categoryId);
      // Refresh transactions
      await fetchTransactions();
    } catch (error) {
      console.error('Failed to categorize transaction:', error);
    }
  };

  return {
    transactions,
    loading,
    pagination,
    fetchTransactions,
    categorizeTransaction,
  };
}
```

### Plaid Link Integration

```javascript
// React Plaid Link Component
import { usePlaidLink } from 'react-plaid-link';

function PlaidLinkButton() {
  const [linkToken, setLinkToken] = useState(null);

  useEffect(() => {
    // Get link token from backend
    api.createLinkToken().then(response => {
      setLinkToken(response.link_token);
    });
  }, []);

  const onSuccess = async (publicToken, metadata) => {
    try {
      // Exchange public token
      await api.exchangePublicToken(publicToken);
      // Refresh accounts
      window.location.reload();
    } catch (error) {
      console.error('Failed to link account:', error);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      Link Bank Account
    </button>
  );
}
```

---

## 🎨 UI/UX Recommendations

### Dashboard Layout
1. **Account Overview** - Balances, recent transactions
2. **Quick Actions** - Add transaction, sync accounts, categorize
3. **Spending Insights** - Charts, budget alerts
4. **Recent Activity** - Latest transactions with categories

### Transaction List Features
- ✅ **Infinite scroll** or pagination
- ✅ **Search and filters** (date, category, amount)
- ✅ **Drag-to-categorize** for quick categorization
- ✅ **Batch operations** for multiple transactions
- ✅ **Real-time sync** status indicators

### Category Management
- ✅ **Hierarchical tree view** for parent/child categories
- ✅ **Color-coded** categories for visual distinction
- ✅ **Budget progress bars** with alerts
- ✅ **Auto-suggestion** based on Plaid data

### Mobile Considerations
- ✅ **Responsive design** for all screen sizes
- ✅ **Touch-friendly** categorization gestures
- ✅ **Offline support** for viewing cached data
- ✅ **Push notifications** for budget alerts

---

## 🚀 Getting Started Checklist

### Backend Setup (Already Complete)
- ✅ Authentication system
- ✅ Plaid integration
- ✅ Transaction categorization
- ✅ Budget tracking
- ✅ Financial insights
- ✅ Real-time sync

### Frontend Development Steps
1. **Authentication Flow** - Login, registration, JWT handling
2. **Account Management** - Link banks via Plaid, view balances
3. **Transaction Interface** - List, filter, search, categorize
4. **Category Management** - Create, edit, budget settings
5. **Dashboard & Insights** - Charts, alerts, spending analysis
6. **Mobile Optimization** - Responsive design, touch interactions

### Environment Variables Needed
```env
# Backend API
REACT_APP_API_URL=https://your-domain.com/api/v1

# Plaid (for frontend Link component)
REACT_APP_PLAID_ENV=sandbox
REACT_APP_PLAID_PUBLIC_KEY=your_plaid_public_key
```

---

## 📞 Support & Resources

- **API Base URL**: `https://your-domain.com/api/v1`
- **Plaid Environment**: `sandbox` (development) / `production`
- **Rate Limits**: See [Rate Limiting section](#rate-limiting--performance)
- **Error Codes**: See [Error Handling section](#error-handling)

**Happy coding! 🚀** Your backend is production-ready and waiting for an amazing frontend experience! 