import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Building,
  Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import api from '../api/client';

export const Profile = () => {
  const { user, setUser } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Edit profile state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Add address state
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [profRes, addrRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/user/addresses')
      ]);
      if (profRes.data?.data) {
        setUser(profRes.data.data);
        setProfileName(profRes.data.data.name);
        setProfilePhone(profRes.data.data.phone || '');
      }
      if (addrRes.data?.data) {
        setAddresses(addrRes.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await api.put('/user/profile', {
        name: profileName,
        phone: profilePhone
      });
      if (res.data?.success) {
        setUser(res.data.data);
        showToast('Profile updated successfully!', 'success');
        setIsEditProfileOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      setSavingAddress(true);
      const res = await api.post('/user/addresses', {
        fullName,
        phoneNumber,
        streetAddress,
        city,
        state,
        postalCode,
        isDefault
      });
      if (res.data?.success) {
        showToast('New address saved to address book', 'success');
        setIsAddAddressOpen(false);
        // Reset form
        setFullName('');
        setPhoneNumber('');
        setStreetAddress('');
        setCity('');
        setState('');
        setPostalCode('');
        setIsDefault(false);
        // Refresh addresses
        const updated = await api.get('/user/addresses');
        setAddresses(updated.data?.data || []);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save address', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/user/addresses/${id}`);
      setAddresses(addresses.filter(a => a.id !== id));
      showToast('Address removed', 'info');
    } catch (err) {
      showToast('Failed to delete address', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">Your Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              <span>Personal Info</span>
            </h2>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="text-xs text-amazon-blue hover:text-amazon-orange font-semibold flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-500 block font-medium">Full Name</span>
              <span className="text-sm font-bold text-gray-900">{user?.name}</span>
            </div>

            <div>
              <span className="text-gray-500 block font-medium">Email Address</span>
              <span className="text-sm font-semibold text-gray-900">{user?.email}</span>
            </div>

            <div>
              <span className="text-gray-500 block font-medium">Phone Number</span>
              <span className="text-sm font-semibold text-gray-900">{user?.phone || 'Not provided'}</span>
            </div>

            <div>
              <span className="text-gray-500 block font-medium">Account Role</span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded font-bold uppercase bg-amber-100 text-amber-900">
                {user?.role}
              </span>
            </div>

            <div className="pt-2 flex items-center gap-2 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Email & OTP Verified</span>
            </div>
          </div>
        </div>

        {/* Address Book Card (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                <span>Saved Addresses</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage delivery destinations for 1-Click checkout</p>
            </div>
            
            <button
              onClick={() => setIsAddAddressOpen(true)}
              className="btn-amazon-primary text-xs font-bold py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              <Building className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p>No saved addresses yet. Add an address for quicker checkout.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-xs space-y-1 relative group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 text-sm">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Default Address
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{addr.streetAddress}</p>
                  <p className="text-gray-700">{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="text-gray-700">{addr.country}</p>
                  <p className="text-gray-500 pt-1">Phone: {addr.phoneNumber}</p>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-end">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile Information"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2.5 text-xs outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2.5 text-xs outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(false)}
              className="btn-amazon-neutral text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingProfile}
              className="btn-amazon-primary text-xs font-bold px-6 py-2"
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddAddressOpen}
        onClose={() => setIsAddAddressOpen(false)}
        title="Add New Delivery Address"
      >
        <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-xs outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-xs outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-xs outline-none focus:border-amber-500"
              placeholder="Flat / House no, Building, Street"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-xs outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-xs outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Postal / ZIP Code</label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-xs outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="def"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded text-amazon-orange focus:ring-amazon-orange cursor-pointer"
            />
            <label htmlFor="def" className="text-gray-700 cursor-pointer">
              Set as default delivery address
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsAddAddressOpen(false)}
              className="btn-amazon-neutral text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingAddress}
              className="btn-amazon-primary text-xs font-bold px-6 py-2"
            >
              {savingAddress ? 'Saving...' : 'Add Address'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
