import { useState } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import type { Account } from '../../types';

interface DisconnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: {
    removeTransactions: boolean;
    removeAccount: boolean;
    keepCategories: boolean;
  }) => void;
  account: Account | null;
  isLoading?: boolean;
}

export default function DisconnectAccountModal({
  isOpen,
  onClose,
  onConfirm,
  account,
  isLoading = false,
}: DisconnectAccountModalProps) {
  const [removeTransactions, setRemoveTransactions] = useState(false);
  const [removeAccount, setRemoveAccount] = useState(false);
  const [keepCategories, setKeepCategories] = useState(true);

  const handleConfirm = () => {
    onConfirm({
      removeTransactions,
      removeAccount,
      keepCategories,
    });
  };

  const handleClose = () => {
    // Reset state when modal closes
    setRemoveTransactions(false);
    setRemoveAccount(false);
    setKeepCategories(true);
    onClose();
  };

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black opacity-50 transition-all duration-300"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 transition-colors duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                Disconnect Account
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 cursor-pointer dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content - Split Layout */}
          <div className="flex">
            {/* Left Side - Impact Summary */}
            <div className="w-1/3 bg-yellow-50 dark:bg-yellow-900/20 border-r border-yellow-200 dark:border-yellow-700 p-6">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                Impact Summary
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-yellow-600 dark:bg-yellow-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Automatic transaction syncing will stop
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-yellow-600 dark:bg-yellow-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Plaid connection will be removed
                </li>
                {removeTransactions && (
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {keepCategories ? 'Transaction data will be deleted but categories preserved' : 'All transaction data will be permanently deleted'}
                  </li>
                )}
                {!removeTransactions && (
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Historical transactions will be kept for reference
                  </li>
                )}
                {removeAccount && (
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Account will be completely removed from your dashboard
                  </li>
                )}
                {!removeAccount && (
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    Account will remain visible but marked as disconnected
                  </li>
                )}
              </ul>
            </div>

            {/* Right Side - Options and Content */}
            <div className="w-2/3 p-6">
              {/* Warning Message */}
              <div className="mb-6">
                <p className="text-gray-900 dark:text-neutral-100 font-medium mb-3">
                  You are about to disconnect:
                </p>
                <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-gray-900 dark:text-neutral-100">
                    {account.display_name || account.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    {account.institution_name} • {account.account_type}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  This will stop automatic transaction syncing from this account. 
                  Choose what happens to your existing data:
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {/* Remove Transactions Option */}
                <div className="border border-gray-200 dark:border-neutral-600 rounded-lg p-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeTransactions}
                      onChange={(e) => setRemoveTransactions(e.target.checked)}
                      disabled={isLoading}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-neutral-600 rounded disabled:opacity-50"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-neutral-100">
                        Remove all historical transactions
                      </div>
                      <div className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                        ⚠️ This will permanently delete all transaction history from this account
                      </div>
                    </div>
                  </label>
                </div>

                {/* Keep Categories Option (only shown when removing transactions) */}
                {removeTransactions && (
                  <div className="border border-gray-200 dark:border-neutral-600 rounded-lg p-4 ml-4">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={keepCategories}
                        onChange={(e) => setKeepCategories(e.target.checked)}
                        disabled={isLoading}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-neutral-600 rounded disabled:opacity-50"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-neutral-100">
                          Preserve transaction categories
                        </div>
                        <div className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                          Keep your custom category assignments for future use
                        </div>
                      </div>
                    </label>
                  </div>
                )}

                {/* Remove Account Option */}
                <div className="border border-gray-200 dark:border-neutral-600 rounded-lg p-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeAccount}
                      onChange={(e) => setRemoveAccount(e.target.checked)}
                      disabled={isLoading}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-neutral-600 rounded disabled:opacity-50"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-neutral-100">
                        Deactivate account entirely
                      </div>
                      <div className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                        ⚠️ Remove the account from your dashboard completely
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-neutral-700">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              loading={isLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect Account'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 