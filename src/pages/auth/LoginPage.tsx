import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
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
  const { login, isLoading, error } = useAuthStore();
  const { addNotification } = useUIStore();

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
      navigate('/dashboard');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Login failed',
        message: 'Please check your credentials and try again.',
      });
    }
  };

  return (
    <div className="flex items-center justify-center bg-neutral-50 mt-20">
      <div className="max-w-sm w-full">
        <div>
          <h2 className="mt-6 text-center text-h1 font-bold text-neutral-900">
            Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Track your expenses and manage your finances
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent placeholder:text-neutral-400 bg-white"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="mt-1 w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent placeholder:text-neutral-400 bg-white"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
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
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-neutral-900 hover:text-neutral-700 underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 