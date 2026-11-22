import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const CustomerPassword = () => {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password requirement checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }

    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber) {
      setErrorMsg('New password does not meet the security requirements below.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('Your new password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccessMsg('Your password has been changed successfully! Keep your new password safe.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="border-b border-neutral-100 pb-4">
        <h1 className="text-xl font-heading font-bold text-[#641B32]">
          Change Account Password
        </h1>
        <p className="text-xs text-[#594E4E] mt-0.5">
          Update your login password to keep your account, orders and saved addresses secure.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xs text-xs flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xs text-xs flex items-center space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Current Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type={showCurrent ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type={showNew ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new strong password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              aria-label={showNew ? 'Hide password' : 'Show password'}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Confirm New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && (
            <p className={`text-[11px] mt-1 font-medium ${passwordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
              {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
            </p>
          )}
        </div>

        {/* Password Security Guidelines */}
        <div className="bg-[#FFF9F0] border border-[#C5A05A]/30 p-4 rounded-xs text-xs space-y-2">
          <div className="flex items-center space-x-1.5 font-semibold text-[#641B32]">
            <Shield className="w-4 h-4 text-[#C5A05A]" />
            <span>Password Security Requirements</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
            <div className={`flex items-center space-x-1.5 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-neutral-500'}`}>
              <span>{hasMinLength ? '✓' : '○'}</span>
              <span>Minimum 8 characters</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasUpper ? 'text-emerald-700 font-semibold' : 'text-neutral-500'}`}>
              <span>{hasUpper ? '✓' : '○'}</span>
              <span>At least 1 uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasLower ? 'text-emerald-700 font-semibold' : 'text-neutral-500'}`}>
              <span>{hasLower ? '✓' : '○'}</span>
              <span>At least 1 lowercase letter (a-z)</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-neutral-500'}`}>
              <span>{hasNumber ? '✓' : '○'}</span>
              <span>At least 1 number (0-9)</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="text-xs px-6 py-2.5 shadow-xs"
          >
            {loading ? (
              <span className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating Password...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerPassword;
