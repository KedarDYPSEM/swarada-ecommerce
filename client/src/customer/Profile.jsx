import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, CheckCircle2, AlertCircle, ShieldCheck, Save, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const CustomerProfile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Populate form with user data when available
  useEffect(() => {
    if (user) {
      let dobString = '';
      if (user.profile?.dateOfBirth) {
        // Format YYYY-MM-DD for date input
        const d = new Date(user.profile.dateOfBirth);
        if (!isNaN(d.getTime())) {
          dobString = d.toISOString().split('T')[0];
        }
      }

      setFormData({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        displayName: user.profile?.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.profile?.gender || '',
        dateOfBirth: dobString,
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // Validation
    if (!formData.firstName.trim()) {
      setErrorMsg('First name is required.');
      return;
    }
    if (!formData.lastName.trim()) {
      setErrorMsg('Last name is required.');
      return;
    }
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9822012345).');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        displayName: formData.displayName.trim() || `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        phone: formData.phone.trim() || null,
        gender: formData.gender || null,
        dateOfBirth: formData.dateOfBirth || null,
      });

      setSuccessMsg('Your profile details have been updated successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
    : '2026';

  const userInitial =
    formData.firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'S';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-neutral-100 pb-4">
        <h1 className="text-xl font-heading font-bold text-[#641B32]">
          My Profile & Details
        </h1>
        <p className="text-xs text-[#594E4E] mt-0.5">
          Manage your personal information, contact numbers and festive celebration preferences.
        </p>
      </div>

      {/* Member Avatar Card */}
      <div className="bg-[#FFF9F0] border border-[#C5A05A]/30 p-5 rounded-xs flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
        <div className="w-16 h-16 rounded-full bg-[#641B32] text-white flex items-center justify-center font-heading text-2xl font-bold shadow-xs shrink-0">
          {userInitial}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-lg font-bold text-[#292323]">
              {formData.firstName ? `${formData.firstName} ${formData.lastName}` : 'Valued Patron'}
            </h2>
            <span className="inline-flex items-center text-[10px] font-bold bg-[#C5A05A]/20 text-[#641B32] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3 mr-1 text-[#C5A05A]" />
              Swarada Privilege Member
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 flex items-center justify-center sm:justify-start space-x-1">
            <Mail className="w-3.5 h-3.5" />
            <span>{formData.email}</span>
            <span className="mx-1.5 text-neutral-300">•</span>
            <span>Member since {memberSince}</span>
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xs text-xs flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xs text-xs flex items-center space-x-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="e.g. Radhika"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="e.g. Kulkarni"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Display Name / Salutation
          </label>
          <Input
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            placeholder="e.g. Radhika Kulkarni (shown on reviews and invoices)"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Input
                type="email"
                disabled
                value={formData.email}
                className="bg-neutral-100 text-neutral-600 cursor-not-allowed pr-24"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-semibold text-emerald-600 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-0.5" />
                Verified
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Your registered primary account email address.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 text-xs">
                +91
              </div>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit mobile (e.g. 9822012345)"
                className="pl-11"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Used for WhatsApp delivery alerts and order updates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full text-xs border border-neutral-300 rounded-xs px-3 py-2 bg-white focus:outline-hidden focus:border-[#641B32]"
            >
              <option value="">Select Gender (Optional)</option>
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Date of Birth
            </label>
            <div className="relative">
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="text-xs"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Enjoy exclusive handloom gifts on your special day.
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="text-xs px-6 py-2.5 shadow-xs"
          >
            {loading ? (
              <span className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5">
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </span>
            )}
          </Button>

          <span className="text-[11px] text-neutral-400">
            All data is securely encrypted.
          </span>
        </div>
      </form>
    </div>
  );
};

export default CustomerProfile;
