import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.ts';

const buttonVariants = cva(
  'cursor-pointer inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus:ring-neutral-100',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus:ring-neutral-400',
        outline: 'border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-500 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:ring-neutral-400',
        ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:ring-neutral-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-700',
      },
      size: {
        xs: 'h-6 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!loading && icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 