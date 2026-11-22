import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const AdminLogin = () => {
  const [serverError, setServerError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const user = await login(data.email, data.password);
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        setServerError('Access denied. Administrator privileges required.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setServerError(err.message || 'Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#292323] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-sm shadow-2xl p-8 sm:p-10 border-t-4 border-[#C5A05A]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#641B32] text-[#C5A05A] rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading text-[#641B32] font-semibold">
            Admin Portal
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
            Swarada Saree Center Management
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#292323] mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="admin@swarada.com"
                error={errors.email?.message}
                {...register('email')}
                className="pl-9"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#292323] mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Input
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
                className="pl-9"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full mt-2 bg-[#641B32] hover:bg-[#7B1E35]"
          >
            <span>Access Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="mt-8 pt-4 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-400">
            Authorized personnel only. All access attempts are logged for security auditing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
