import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import type { RegisterData } from '../../types';

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirmation: z.string()
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, isLoading, error, isAuthenticated } = useAuthStore();
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
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser(data);
      addNotification({
        type: 'success',
        title: 'Account created!',
        message: 'Your account has been created successfully.',
      });
      // Navigate to the intended destination or dashboard
      navigate(from, { replace: true });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Registration failed',
        message: 'Please check your information and try again.',
      });
    }
  };

  return (
    <div className="flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 mt-20 transition-colors duration-200">
      <div className="max-w-sm w-full">
        <div>
          <h2 className="mt-6 text-center text-h1 font-bold text-neutral-900 dark:text-neutral-100">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Start tracking your expenses today
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-10">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  First name
                </label>
                <input
                  {...register('first_name')}
                  type="text"
                  autoComplete="given-name"
                  className="mt-1 w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400 focus:border-transparent placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  placeholder="First name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Last name
                </label>
                <input
                  {...register('last_name')}
                  type="text"
                  autoComplete="family-name"
                  className="mt-1 w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400 focus:border-transparent placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  placeholder="Last name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_name.message}</p>
                )}
              </div>
            </div>

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
                autoComplete="new-password"
                className="mt-1 w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400 focus:border-transparent placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Confirm password
              </label>
              <input
                {...register('password_confirmation')}
                type="password"
                autoComplete="new-password"
                className="mt-1 w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400 focus:border-transparent placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                placeholder="Confirm your password"
              />
              {errors.password_confirmation && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation.message}</p>
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
              className="w-full"
              size="lg"
            >
              Create account
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-300 underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 