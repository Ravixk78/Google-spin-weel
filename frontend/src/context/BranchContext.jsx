import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
  const [detectedBranch, setDetectedBranch] = useState(null);
  const [loadingBranch, setLoadingBranch] = useState(true);
  const [branchError, setBranchError] = useState(null);

  useEffect(() => {
    // Read URL params
    const searchParams = new URLSearchParams(window.location.search);
    const branchCode = searchParams.get('branch');
    const qrToken = searchParams.get('qr');

    if (branchCode || qrToken) {
      detectBranchFromUrl(branchCode, qrToken);
    } else {
      // Default fallback to Kalba for testing if no URL params passed
      detectBranchFromUrl('kalba', null);
    }
  }, []);

  const detectBranchFromUrl = async (branchCode, qrToken) => {
    setLoadingBranch(true);
    setBranchError(null);
    try {
      const res = await api.get('/branches/detect', {
        params: { branch: branchCode, qr: qrToken }
      });
      setDetectedBranch(res.data.branch);
    } catch (err) {
      console.error('Branch Auto-detection Error:', err);
      setBranchError(err.response?.data?.error || 'Failed to detect physical branch from QR code.');
    } finally {
      setLoadingBranch(false);
    }
  };

  return (
    <BranchContext.Provider value={{
      detectedBranch,
      loadingBranch,
      branchError,
      setDetectedBranch,
      detectBranchFromUrl
    }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => useContext(BranchContext);
