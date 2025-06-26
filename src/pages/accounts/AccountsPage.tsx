import DashboardLayout from '../../components/layout/Layout';
import AccountsList from '../../components/accounts/AccountsList';
import PlaidLinkButton from '../../components/plaid/PlaidLinkButton';

export default function AccountsPage() {
  return (
    <DashboardLayout 
      title="Accounts" 
      subtitle="Manage your connected bank accounts"
    >
      <div className="space-y-6">
        {/* Header with Add Account */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Connected Accounts</h2>
              <p className="text-sm text-gray-600 mt-1">
                Connect your bank accounts to automatically track transactions and expenses
              </p>
            </div>
            <PlaidLinkButton />
          </div>
        </div>

        {/* Accounts List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <AccountsList />
        </div>

        {/* Account Management Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Account Security & Privacy
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Your banking information is secured with bank-level 256-bit encryption. 
                  We use Plaid to connect to your accounts, which is trusted by thousands of apps and millions of users.
                </p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>We never store your banking credentials</li>
                  <li>All data is encrypted in transit and at rest</li>
                  <li>You can disconnect accounts at any time</li>
                  <li>We only access transaction data, never account control</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 