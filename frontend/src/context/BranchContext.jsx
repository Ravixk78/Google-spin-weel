import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const BranchContext = createContext();

const defaultBranch = {
  id: 1,
  code: 'kalba',
  name: 'Kalba Branch',
  address: 'Al Corniche Road, Kalba, Sharjah, UAE',
  google_review_url: 'https://g.page/r/CZm3IGOsQ2F9EAE/review',
  qr_code_token: 'QR-KALBA-2026-TOKEN982'
};

export const BranchProvider = ({ children }) => {
  const [detectedBranch, setDetectedBranch] = useState(defaultBranch);
  const [loadingBranch, setLoadingBranch] = useState(false);
  const [branchError, setBranchError] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const branchCode = searchParams.get('branch');
    const qrToken = searchParams.get('qr');

    if (branchCode || qrToken) {
      detectBranchFromUrl(branchCode, qrToken);
    }
  }, []);

  const detectBranchFromUrl = async (branchCode, qrToken) => {
    try {
      const res = await api.get('/branches/detect', {
        params: { branch: branchCode, qr: qrToken }
      });
      if (res.data && res.data.branch) {
        setDetectedBranch(res.data.branch);
      }
    } catch (err) {
      console.warn('Branch detection warning (using fallback):', err);
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

