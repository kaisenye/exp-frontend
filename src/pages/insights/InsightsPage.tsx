import DashboardLayout from '../../components/layout/Layout';

export default function InsightsPage() {
  return (
    <DashboardLayout 
      title="Insights" 
      subtitle="Discover spending patterns and financial insights"
    >
      <div className="space-y-6">
        {/* Insights Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className="text-2xl font-semibold text-gray-900">12.5%</p>
                <p className="text-xs text-green-600">+2.1% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Category</p>
                <p className="text-lg font-semibold text-gray-900">Food & Dining</p>
                <p className="text-xs text-blue-600">35% of spending</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Daily Spend</p>
                <p className="text-2xl font-semibold text-gray-900">$52.30</p>
                <p className="text-xs text-red-600">+$5.20 from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Budget Status</p>
                <p className="text-lg font-semibold text-gray-900">On Track</p>
                <p className="text-xs text-green-600">75% used this month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Spending Trends Chart Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Spending Trends</h3>
              <p className="text-sm text-gray-600">Your spending patterns over the last 6 months</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md">6M</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-md">3M</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-md">1M</button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500 font-medium">Interactive Charts Coming Soon</p>
              <p className="text-sm text-gray-400 mt-1">Connect accounts to see your spending trends</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown and Monthly Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h3>
            <div className="space-y-4">
              {[
                { name: 'Food & Dining', amount: '$856', percentage: 35, color: 'bg-red-500' },
                { name: 'Transportation', amount: '$412', percentage: 20, color: 'bg-blue-500' },
                { name: 'Shopping', amount: '$324', percentage: 16, color: 'bg-purple-500' },
                { name: 'Entertainment', amount: '$198', percentage: 10, color: 'bg-green-500' },
                { name: 'Others', amount: '$340', percentage: 19, color: 'bg-gray-500' },
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${category.color} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{category.percentage}%</span>
                    <span className="text-sm font-medium text-gray-900">{category.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Comparison */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Comparison</h3>
            <div className="space-y-4">
              {[
                { month: 'January', amount: '$2,145', change: '+12%', trend: 'up' },
                { month: 'February', amount: '$1,987', change: '-7%', trend: 'down' },
                { month: 'March', amount: '$2,234', change: '+12%', trend: 'up' },
                { month: 'April', amount: '$2,067', change: '-7%', trend: 'down' },
                { month: 'May', amount: '$2,189', change: '+6%', trend: 'up' },
              ].map((month, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-900">{month.month}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{month.amount}</span>
                    <span className={`text-sm ${month.trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                      {month.change}
                    </span>
                    <svg 
                      className={`w-4 h-4 ${month.trend === 'up' ? 'text-red-600 transform rotate-180' : 'text-green-600'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0l-7 7m7-7v18" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-blue-900 mb-2">💡 Smart Insights</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• You're spending 15% more on dining out compared to last month. Consider meal planning to save money.</p>
                <p>• Great job! Your transportation costs decreased by 8% this month.</p>
                <p>• You're on track to save $320 this month if you maintain your current spending pattern.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 