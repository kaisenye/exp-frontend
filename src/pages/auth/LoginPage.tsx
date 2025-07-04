import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import type { LoginCredentials } from '../../types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  const { addNotification } = useUIStore();

  // Get the intended destination from location state, or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      await login(data);
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have been successfully logged in.',
      });
      // Navigate to the intended destination or dashboard
      navigate(from, { replace: true });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Login failed',
        message: 'Please check your credentials and try again.',
      });
    }
  };

  return (
    <div className="flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 mt-20 transition-colors duration-200">
      <div className="max-w-sm w-full">
        <div>
          <h2 className="mt-6 text-center text-h1 font-bold text-neutral-900 dark:text-neutral-100">
            Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Track your expenses and manage your finances
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400 focus:border-transparent placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="mt-1 w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400 focus:border-transparent placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div>
            <Button
              type="submit"
              loading={isLoading}
              variant="primary"
              className="w-full"
              size="lg"
            >
              Sign in
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-300 underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 