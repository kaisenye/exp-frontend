import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters.ts';
import type { Account } from '../../types';

interface AccountCardProps {
  account: Account;
  onSync?: (accountId: number) => void;
  onDisconnect?: (accountId: number) => void;
  isLoading?: boolean;
}

export default function AccountCard({
  account,
  onSync,
  onDisconnect,
  isLoading = false,
}: AccountCardProps) {
  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'savings':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'credit':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'investment':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300';
    }
  };

  const getStatusColor = (active: boolean) => {
    return active
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
  };

  const formatAccountId = (id: number) => {
    return `••••${id.toString().slice(-4)}`;
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6 hover:shadow-md dark:hover:shadow-lg hover:shadow-gray-200 dark:hover:shadow-neutral-900/50 transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-1">
            {account.display_name || account.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            {account.institution_name} • {formatAccountId(account.id)}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(
              account.account_type
            )}`}
          >
            {account.account_type}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              account.active
            )}`}
          >
            {account.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
            {formatCurrency(account.balance_current)}
          </span>
          {account.balance_available !== account.balance_current && (
            <span className="text-sm text-gray-500 dark:text-neutral-400">
              Available: {formatCurrency(account.balance_available)}
            </span>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-neutral-400">Currency:</span>
          <span className="ml-2 uppercase text-gray-900 dark:text-neutral-100">{account.currency}</span>
        </div>
        {account.last_sync_at && (
          <div>
            <span className="text-gray-500 dark:text-neutral-400">Last Synced:</span>
            <span className="ml-2 text-gray-900 dark:text-neutral-100">
              {new Date(account.last_sync_at).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-neutral-600">
        {onSync && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSync(account.id)}
            disabled={isLoading || !account.active}
            loading={isLoading}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            }
          >
            Sync
          </Button>
        )}
        
        {onDisconnect && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDisconnect(account.id)}
            disabled={isLoading}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-500"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            }
          >
            Disconnect
          </Button>
        )}
      </div>
    </div>
  );
} 