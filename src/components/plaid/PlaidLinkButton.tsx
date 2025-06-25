import React, { useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { plaidService, PlaidService } from '../../services/plaidService';
import { useUIStore } from '../../stores/uiStore';
import type { PlaidError } from '../../types';

interface PlaidLinkButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: PlaidError) => void;
  className?: string;
}

export default function PlaidLinkButton({
  variant = 'primary',
  size = 'md',
  children = 'Connect Bank Account',
  onSuccess,
  onError,
  className,
}: PlaidLinkButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();

  // Fetch link token
  const {
    data: linkToken,
    isLoading: isLoadingToken,
    error: tokenError,
  } = useQuery({
    queryKey: ['plaid-link-token'],
    queryFn: () => plaidService.createLinkToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Exchange public token mutation
  const exchangeTokenMutation = useMutation({
    mutationFn: (publicToken: string) => plaidService.exchangePublicToken(publicToken),
    onSuccess: (data) => {
      addNotification({
        type: 'success',
        title: 'Bank Connected!',
        message: `Successfully connected ${data.accounts.length} account(s).`,
      });
      
      // Invalidate accounts query to refetch
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      
      setIsConnecting(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: error.message || 'Failed to connect bank account.',
      });
      
      setIsConnecting(false);
      onError?.(error);
    },
  });

  const handleOnSuccess = useCallback(
    (public_token: string, metadata: any) => {
      setIsConnecting(true);
      console.log('Plaid Link successful:', { public_token, metadata });
      exchangeTokenMutation.mutate(public_token);
    },
    [exchangeTokenMutation]
  );

  const handleOnExit = useCallback(
    (err: any, metadata: any) => {
      console.log('Plaid Link exit:', { err, metadata });
      setIsConnecting(false);
      
      if (err) {
        const plaidError = err as PlaidError;
        const errorMessage = PlaidService.handlePlaidError(plaidError);
        
        addNotification({
          type: 'error',
          title: 'Connection Cancelled',
          message: errorMessage,
        });
        
        onError?.(plaidError);
      }
    },
    [addNotification, onError]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken || null,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
    env: (import.meta.env.VITE_PLAID_ENV as 'sandbox' | 'development' | 'production') || 'sandbox',
  });

  const handleClick = () => {
    if (!ready || !linkToken) {
      addNotification({
        type: 'warning',
        title: 'Not Ready',
        message: 'Please wait while we prepare the connection...',
      });
      return;
    }
    
    open();
  };

  const isLoading = isLoadingToken || isConnecting || exchangeTokenMutation.isPending;

  if (tokenError) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={className}
      >
        Connection Unavailable
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      loading={isLoading}
      onClick={handleClick}
      disabled={!ready || !linkToken}
      className={className}
      icon={
        !isLoading ? (
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        ) : undefined
      }
    >
      {isConnecting ? 'Connecting...' : children}
    </Button>
  );
} 