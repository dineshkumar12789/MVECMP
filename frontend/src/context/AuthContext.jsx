import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // 1. Step 1: Initiate Login -> Triggers OTP
  const initiateLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  // 2. Step 2: Verify OTP -> Returns JWT & User details
  const verifyOtp = async (email, otpCode) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otpCode });
      const { token: jwtToken, id, name, email: userEmail, role } = res.data.data;
      const userData = { id, name, email: userEmail, role };

      setToken(jwtToken);
      setUser(userData);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  // 3. Resend OTP
  const resendOtp = async (email) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/resend-otp', { email });
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  // 4. Register
  const register = async (name, email, password, phone, role = 'USER') => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, phone, role });
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  // 5. Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        loading,
        initiateLogin,
        verifyOtp,
        resendOtp,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
