import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Home, Briefcase, Star } from 'lucide-react';
import orderService from '../services/orderService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const CustomerAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  };

  const [formData, setFormData] = useState(initialForm);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = async () => {
    try {
      const data = await orderService.getAddresses();
      if (data) setAddresses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowForm(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const openEditForm = (addr) => {
    setEditingId(addr.id);
    setFormData({
      label: addr.label || 'Home',
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      isDefault: Boolean(addr.isDefault),
    });
    setShowForm(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setErrorMsg('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    if (!formData.addressLine1.trim()) {
      setErrorMsg('Flat / House No. & Building is compulsory for courier shipping labels.');
      return;
    }
    if (!formData.addressLine2.trim()) {
      setErrorMsg('Area / Colony / Locality is compulsory for courier shipping labels.');
      return;
    }
    if (!formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
      setErrorMsg('City, State and Pincode are compulsory.');
      return;
    }
    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setErrorMsg('Please enter a valid 6-digit postal pincode.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await orderService.updateAddress(editingId, formData);
        if (updated) setAddresses(updated);
        setSuccessMsg('Address updated successfully!');
      } else {
        await orderService.addAddress(formData);
        await fetchAddresses();
        setSuccessMsg('New address saved successfully!');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(initialForm);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Error saving address. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const updated = await orderService.setDefaultAddress(id);
      if (updated) setAddresses(updated);
      setSuccessMsg('Default address updated!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setErrorMsg(e.message || 'Could not update default address.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      const updated = await orderService.deleteAddress(id);
      if (updated) setAddresses(updated);
      setSuccessMsg('Address removed.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setErrorMsg(e.message || 'Error deleting address.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 gap-3">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#641B32]">
            Saved Delivery Addresses
          </h1>
          <p className="text-xs text-[#594E4E] mt-0.5">
            Manage your doorstep delivery locations for swift, secure checkout.
          </p>
        </div>

        <Button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
            } else {
              openAddForm();
            }
          }}
          variant="secondary"
          size="sm"
          className="text-xs self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>{showForm ? 'Cancel' : 'Add New Address'}</span>
        </Button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xs text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xs text-xs flex items-center space-x-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Add / Edit Address Form */}
      {showForm && (
        <form onSubmit={handleSave} noValidate className="p-6 bg-[#FFF9F0] border border-[#C5A05A]/40 rounded-xs space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#C5A05A]/20 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#641B32]">
              {editingId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h3>
            <span className="text-[11px] text-neutral-400">* Required fields</span>
          </div>

          {/* Label selector */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-neutral-700">Address Type:</span>
            {['Home', 'Work', 'Other'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setFormData({ ...formData, label })}
                className={`px-3 py-1 text-xs rounded-xs font-medium transition-colors cursor-pointer ${
                  formData.label === label
                    ? 'bg-[#641B32] text-white'
                    : 'bg-white border border-neutral-300 text-neutral-700 hover:border-[#641B32]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Ananya Joshi"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <Input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit number (e.g. 9822012345)"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Flat / House No. / Building / Street <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              placeholder="e.g. Flat 301, Shree Ganesh Heights, Mahadwar Road"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Area / Colony / Locality / Road <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                placeholder="e.g. 5th Lane Rajarampuri, Main Road"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Landmark (Optional)
              </label>
              <Input
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="e.g. Opp. Binkhambi Ganesh Mandir"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Kolhapur"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Maharashtra"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="e.g. 416008"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="rounded text-[#641B32] focus:ring-[#641B32]"
            />
            <label htmlFor="isDefault" className="text-xs text-neutral-700 select-none cursor-pointer">
              Set this as my default delivery address for future purchases
            </label>
          </div>

          <div className="flex items-center space-x-3 pt-3">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              size="sm"
              className="text-xs px-5 shadow-xs"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="text-xs"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-2 border-[#C5A05A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-neutral-500">Loading your addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="border border-dashed border-neutral-300 rounded-xs p-10 text-center space-y-3 bg-neutral-50/50">
          <MapPin className="w-10 h-10 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-bold text-[#292323]">No saved addresses yet</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Add your residential or office shipping address to save time when placing handloom saree orders.
          </p>
          <Button onClick={openAddForm} variant="primary" size="sm" className="text-xs mt-2">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add First Address
          </Button>
        </div>
      ) : (
        /* Address Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 border rounded-xs bg-white shadow-xs space-y-3 relative transition-all ${
                addr.isDefault
                  ? 'border-[#641B32] ring-1 ring-[#641B32]/30'
                  : 'border-neutral-200 hover:border-[#641B32]/60'
              }`}
            >
              {/* Badge & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold bg-[#641B32]/10 text-[#641B32] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1">
                    {addr.label === 'Work' ? (
                      <Briefcase className="w-3 h-3 mr-1" />
                    ) : (
                      <Home className="w-3 h-3 mr-1" />
                    )}
                    <span>{addr.label || 'Home'}</span>
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center">
                      <Star className="w-2.5 h-2.5 mr-1 fill-amber-500 text-amber-500" />
                      Default
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditForm(addr)}
                    className="text-neutral-500 hover:text-[#641B32] p-1.5 rounded hover:bg-neutral-100 transition-colors cursor-pointer"
                    title="Edit address"
                    aria-label="Edit address"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-neutral-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete address"
                    aria-label="Delete address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Address details */}
              <div className="text-xs text-[#292323] space-y-1">
                <p className="font-bold text-sm text-[#292323]">{addr.fullName}</p>
                <p className="text-neutral-600">{addr.addressLine1}</p>
                {addr.addressLine2 && <p className="text-neutral-600">{addr.addressLine2}</p>}
                {addr.landmark && (
                  <p className="text-neutral-500 text-[11px]">Landmark: {addr.landmark}</p>
                )}
                <p className="text-neutral-700 font-medium">
                  {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span>
                </p>
                <p className="text-neutral-500 text-[11px] pt-1 flex items-center space-x-1">
                  <span>Phone:</span>
                  <span className="font-mono font-medium text-[#292323]">+91 {addr.phone}</span>
                </p>
              </div>

              {/* Set as Default button */}
              {!addr.isDefault && (
                <div className="pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[11px] font-semibold text-[#641B32] hover:underline cursor-pointer"
                  >
                    Set as Default Address
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerAddresses;
