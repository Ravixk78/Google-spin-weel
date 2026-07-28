import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || null);
  const [adminUser, setAdminUser] = useState(JSON.parse(localStorage.getItem('adminUser') || 'null'));
  
  const [customerToken, setCustomerToken] = useState(localStorage.getItem('customerToken') || null);
  const [customerUser, setCustomerUser] = useState(JSON.parse(localStorage.getItem('customerUser') || 'null'));

  // Admin Login
  const loginAdmin = async (email, password) => {
    const res = await api.post('/admin/login', { email, password });
    const { token, admin } = res.data;
    setAdminToken(token);
    setAdminUser(admin);
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(admin));
    return admin;
  };

  // Admin Logout
  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  // Customer Google Auth (Real or Dev Sandbox)
  const loginCustomerGoogle = async (googleData) => {
    const res = await api.post('/customer/auth/google', googleData);
    const { token, customer } = res.data;
    setCustomerToken(token);
    setCustomerUser(customer);
    localStorage.setItem('customerToken', token);
    localStorage.setItem('customerUser', JSON.stringify(customer));
    return customer;
  };

  // Customer Logout
  const logoutCustomer = () => {
    setCustomerToken(null);
    setCustomerUser(null);
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
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
