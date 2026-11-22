import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle } from 'lucide-react';
import orderService from '../services/orderService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const CustomerAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: 'Kolhapur',
    state: 'Maharashtra',
    pincode: '416008',
  });

  const fetchAddresses = async () => {
    try {
      const data = await orderService.getAddresses();
      if (data) setAddresses(data);
    } catch (e) {
      //
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await orderService.addAddress(formData);
      setShowAddForm(false);
      fetchAddresses();
    } catch (e) {
      alert(e.message || 'Error saving address');
    }
  };

  const handleDelete = async (id) => {
    try {
      await orderService.deleteAddress(id);
      fetchAddresses();
    } catch (e) {
      alert(e.message || 'Error deleting address');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#641B32]">
            Saved Delivery Addresses
          </h1>
          <p className="text-xs text-[#594E4E] mt-0.5">
            Manage your shipping destinations for faster one-click checkout.
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="secondary"
          size="sm"
          className="text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>{showAddForm ? 'Cancel' : 'Add New Address'}</span>
        </Button>
      </div>

      {/* Add Address Form Modal / Inline */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="p-6 bg-[#FFF9F0] border border-[#C5A05A]/40 rounded-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#641B32]">
            New Delivery Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Full Name</label>
              <Input
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ananya Joshi"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Mobile Number</label>
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9822012345"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Address Line 1</label>
            <Input
              required
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              placeholder="Flat 402, Building Name, Street"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">City</label>
              <Input
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">State</label>
              <Input
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Pincode</label>
              <Input
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="sm" className="mt-2">
            Save Address
          </Button>
        </form>
      )}

      {/* Address Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-5 border border-neutral-200 rounded-xs bg-white shadow-xs space-y-3 relative hover:border-[#641B32] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-[#641B32]/10 text-[#641B32] px-2.5 py-0.5 rounded uppercase tracking-wider">
                {addr.label} {addr.isDefault && '• Default'}
              </span>
              <button
                onClick={() => handleDelete(addr.id)}
                className="text-neutral-400 hover:text-red-600 p-1 cursor-pointer"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#292323] space-y-1">
              <p className="font-semibold text-sm">{addr.fullName}</p>
              <p className="text-neutral-600">{addr.addressLine1}</p>
              {addr.addressLine2 && <p className="text-neutral-600">{addr.addressLine2}</p>}
              <p className="text-neutral-600">
                {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-neutral-500 font-mono text-[11px] pt-1">Phone: {addr.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerAddresses;
