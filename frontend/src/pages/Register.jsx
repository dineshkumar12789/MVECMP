import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  ShieldCheck, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/Toast';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(searchParams.get('role') === 'ADMIN' ? 'ADMIN' : 'USER');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password, phone, role);
      showToast('Registration successful! Please sign in.', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      {/* Amazon Logo Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-block">
          <span className="text-3xl font-black tracking-tight text-gray-900">
            amazon<span className="text-[#febd69] font-normal text-lg ml-0.5">marketplace</span>
          </span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-xl border border-gray-200 sm:px-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-xs text-gray-500 mb-6">
            Join the Amazon multi-vendor shopping platform as a Customer or Store Administrator.
          </p>

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {/* Account Role Selector */}
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">Register As</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`p-2.5 rounded-lg border font-bold text-center transition-all ${
                    role === 'USER'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                  <span>Customer (USER)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`p-2.5 rounded-lg border font-bold text-center transition-all ${
                    role === 'ADMIN'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                  <span>Manager (ADMIN)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-amber-500 text-xs"
                placeholder="First and last name"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-amber-500 text-xs"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Mobile Number (Optional)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-amber-500 text-xs"
                placeholder="+1 555-0199"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-amber-500 text-xs"
                placeholder="At least 6 characters"
                required
              />
              <p className="text-[11px] text-gray-500 mt-1">Passwords must be at least 6 characters.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-amazon-primary text-xs font-bold py-3 flex items-center justify-center gap-2 mt-4 shadow-xs"
            >
              {loading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-200 text-center text-xs">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="text-amazon-blue hover:underline font-bold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
