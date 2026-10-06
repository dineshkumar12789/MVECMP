import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  KeyRound, 
  Clock, 
  RotateCcw, 
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/Toast';

export const Login = () => {
  const { initiateLogin, verifyOtp, resendOtp, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1); // 1 = Email/Password, 2 = OTP Verification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
  };

  // Countdown timer for Step 2 OTP
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Preset demo accounts for quick one-click testing
  const fillCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@mvecm.com');
      setPassword('Admin@123');
    } else {
      setEmail('customer@example.com');
      setPassword('Customer@123');
    }
  };

  // Step 1: Validate Email + Password -> Server generates OTP
  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await initiateLogin(email, password);
      showToast('6-Digit OTP sent to your email!', 'success');
      
      // Capture dev OTP if returned by development mode
      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      
      setStep(2);
      setTimer(300);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP -> Server validates and issues JWT
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      showToast('Please enter a valid 6-digit OTP code', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(email, otpCode);
      showToast('Verification successful! Welcome back.', 'success');

      const role = res.data?.role;
      const destination = location.state?.from?.pathname || (role === 'ADMIN' ? '/admin' : '/');
      navigate(destination, { replace: true });
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Invalid or expired OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const res = await resendOtp(email);
      showToast('A new OTP has been dispatched to your email', 'info');
      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      setTimer(300);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resend OTP', 'error');
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
          
          {step === 1 ? (
            /* STEP 1: Email & Password */
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h2>
              <p className="text-xs text-gray-500 mb-6">
                Enter your registered email and password to receive a 2FA OTP security code.
              </p>

              <form onSubmit={handleSubmitCredentials} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email address</label>
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-bold text-gray-700">Password</label>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-amber-500 text-xs"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-amazon-primary text-xs font-bold py-3 flex items-center justify-center gap-2 mt-2 shadow-xs"
                >
                  {loading ? (
                    <span>Validating credentials...</span>
                  ) : (
                    <>
                      <span>Continue & Send OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Fill Demo Credentials Buttons */}
              <div className="mt-6 pt-5 border-t border-gray-200">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">
                  Quick Demo Accounts (1-Click Fill)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => fillCredentials('admin')}
                    className="p-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-900 font-bold transition-colors text-left"
                  >
                    <span className="block text-[11px] text-amber-700">Admin Account</span>
                    <span>admin@mvecm.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('customer')}
                    className="p-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-900 font-bold transition-colors text-left"
                  >
                    <span className="block text-[11px] text-blue-700">Customer Account</span>
                    <span>customer@example.com</span>
                  </button>
                </div>
              </div>

              {/* Create account link */}
              <div className="mt-6 text-center text-xs">
                <span className="text-gray-500">New to Amazon Marketplace? </span>
                <Link to="/register" className="text-amazon-blue hover:underline font-bold">
                  Create your account
                </Link>
              </div>
            </div>
          ) : (
            /* STEP 2: 6-Digit OTP Verification */
            <div>
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
                Two-Step Verification
              </h2>
              <p className="text-xs text-gray-500 text-center mb-6">
                For added security, enter the 6-digit one-time password (OTP) sent to{' '}
                <strong className="text-gray-800">{email}</strong>.
              </p>

              {/* Developer OTP Auto-Fill Box */}
              {devOtp && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 mb-5 text-xs text-emerald-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold block flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Dev Mode OTP Code:
                    </span>
                    <span className="font-mono text-base font-extrabold tracking-widest text-emerald-800">
                      {devOtp}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(devOtp)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded text-[11px] transition-colors"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block font-bold text-gray-700">Enter 6-digit OTP code</label>
                    <span className="text-gray-500 font-semibold flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Expires in: <strong className="text-amber-700">{formatTimer()}</strong>
                    </span>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold border-2 border-gray-300 focus:border-amber-500 rounded-lg py-2.5 outline-none bg-gray-50 focus:bg-white transition-all"
                    autoFocus
                    required
                  />
                  <p className="text-[11px] text-gray-400 mt-1 text-center">
                    Maximum 3 verification attempts permitted
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full btn-amazon-primary text-xs font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Sign In'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-800 font-medium"
                >
                  ← Back to login
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-amazon-blue hover:text-amazon-orange font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Resend Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
