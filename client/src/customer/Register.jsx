import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Phone, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/\d/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const CustomerRegister = () => {
  const [serverError, setServerError] = useState('');
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await registerAuth({
        email: data.email,
        phone: data.phone,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      navigate('/account/dashboard');
    } catch (err) {
      setServerError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white p-8 sm:p-10 border border-[#C5A05A]/30 rounded-sm shadow-md">
        <div className="text-center mb-8">
          <span className="text-[#C5A05A] text-xs font-semibold tracking-widest uppercase">
            Swarada Saree Center
          </span>
          <h1 className="mt-2 text-3xl font-heading text-[#641B32] font-semibold">
            Create an Account
          </h1>
          <p className="mt-2 text-sm text-[#594E4E]">
            Join our bridal and ethnic saree club to enjoy special privileges and quick checkout.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#292323] mb-1">
                First Name
              </label>
              <div className="relative">
                <Input
                  placeholder="e.g. Ananya"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                  className="pl-9"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#292323] mb-1">
                Last Name
              </label>
              <div className="relative">
                <Input
                  placeholder="e.g. Joshi"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                  className="pl-9"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#292323] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="e.g. ananya@example.com"
                error={errors.email?.message}
                {...register('email')}
                className="pl-9"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#292323] mb-1">
              Mobile Number (Optional)
            </label>
            <div className="relative">
              <Input
                type="tel"
                placeholder="e.g. 9822012345"
                error={errors.phone?.message}
                {...register('phone')}
                className="pl-9"
              />
              <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#292323] mb-1">
              Password
            </label>
            <div className="relative">
              <Input
                type="password"
                placeholder="e.g. Min 8 characters with letters & numbers"
                error={errors.password?.message}
                {...register('password')}
                className="pl-9"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#292323] mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type="password"
                placeholder="e.g. Repeat password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
                className="pl-9"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <Button type="submit" isLoading={isSubmitting} className="w-full mt-4">
            <span>Register & Continue</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
          <p className="text-sm text-[#594E4E]">
            Already have an account?{' '}
            <Link to="/account/login" className="text-[#641B32] font-semibold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;
