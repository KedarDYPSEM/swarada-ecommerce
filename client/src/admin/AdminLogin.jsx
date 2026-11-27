import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Lock, Mail, ArrowRight, KeyRound, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../services/api';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const AdminLogin = () => {
  const [serverError, setServerError] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('kdurugade1005@gmail.com');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState(null); // { type: 'success' | 'error', message: '', tempPass?: '' }

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: 'kdurugade1005@gmail.com',
    },
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setForgotLoading(true);
    setForgotStatus(null);

    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      const data = res.data?.data || {};
      setForgotStatus({
        type: 'success',
        message: `Password reset instructions have been dispatched to ${forgotEmail}.`,
        tempPass: data.temporaryPassword,
        emailSent: data.emailSent,
      });
    } catch (err) {
      setForgotStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to dispatch reset email. Please verify your email.',
      });
    } finally {
      setForgotLoading(false);
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
              Admin Email / Username
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="e.g. kdurugade1005@gmail.com"
                error={errors.email?.message}
                {...register('email')}
                className="pl-9"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#292323]">
                Admin Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotStatus(null);
                  setForgotModalOpen(true);
                }}
                className="text-[11px] text-[#C5A05A] hover:text-[#641B32] font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Input
                type="password"
                placeholder="e.g. Enter admin password"
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

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 shadow-2xl border-t-4 border-[#C5A05A] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center space-x-2 text-[#641B32]">
                <KeyRound className="w-5 h-5 text-[#C5A05A]" />
                <h3 className="font-heading font-bold text-base">Reset Admin Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
              Enter your registered administrator email address. We will immediately dispatch reset instructions and access credentials to your inbox.
            </p>

            {forgotStatus && (
              <div
                className={`mt-4 p-3 rounded-sm text-xs ${
                  forgotStatus.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {forgotStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{forgotStatus.message}</p>
                    {forgotStatus.tempPass && (
                      <div className="mt-2 p-2 bg-white rounded border border-emerald-200">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">
                          New Temporary Password:
                        </span>
                        <code className="text-sm font-mono font-bold text-[#641B32]">
                          {forgotStatus.tempPass}
                        </code>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          You can log in now using this password, or check your email ({forgotEmail})!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1 uppercase tracking-wider">
                  Admin Email
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="kdurugade1005@gmail.com"
                    className="pl-9 text-xs"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForgotModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={forgotLoading}
                  className="bg-[#641B32] hover:bg-[#7B1E35] text-white"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Credentials to Email'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
