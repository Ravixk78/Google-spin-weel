import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const safeParseJSON = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return null;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Failed to parse localStorage key ${key}`, e);
    try { localStorage.removeItem(key); } catch (err) {}
    return null;
  }
};

const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key) || null;
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(() => safeGetItem('adminToken'));
  const [adminUser, setAdminUser] = useState(() => safeParseJSON('adminUser'));
  
  const [customerToken, setCustomerToken] = useState(() => safeGetItem('customerToken'));
  const [customerUser, setCustomerUser] = useState(() => safeParseJSON('customerUser'));

  // Admin Login
  const loginAdmin = async (email, password) => {
    const res = await api.post('/admin/login', { email, password });
    const { token, admin } = res.data;
    setAdminToken(token);
    setAdminUser(admin);
    try {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(admin));
    } catch (e) {}
    return admin;
  };

  // Admin Logout
  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    } catch (e) {}
  };

  // Customer Google Auth
  const loginCustomerGoogle = async (googleData) => {
    try {
      const res = await api.post('/customer/auth/google', googleData);
      const { token, customer } = res.data;
      setCustomerToken(token);
      setCustomerUser(customer);
      try {
        localStorage.setItem('customerToken', token);
        localStorage.setItem('customerUser', JSON.stringify(customer));
      } catch (e) {}
      return customer;
    } catch (err) {
      console.warn('Google Customer Auth warning:', err);
      return null;
    }
  };

  // Customer Logout
  const logoutCustomer = () => {
    setCustomerToken(null);
    setCustomerUser(null);
    try {
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerUser');
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{
      adminToken,
      adminUser,
      loginAdmin,
      logoutAdmin,
      customerToken,
      customerUser,
      loginCustomerGoogle,
      logoutCustomer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

