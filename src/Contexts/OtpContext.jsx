import React, { createContext, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const OtpContext = createContext(null);

export function OtpProvider({ children }) {
  const [otpData, setOtpData] = useState(null);

  const setOtp = (data) => {
    setOtpData(data);
  };

  const clearOtp = () => {
    setOtpData(null);
  };

  const value = useMemo(
    () => ({ otpData, setOtp, clearOtp }),
    [otpData],
  );

  return <OtpContext.Provider value={value}>{children}</OtpContext.Provider>;
}

OtpProvider.propTypes = {
  children: PropTypes.node,
};

export function useOtp() {
  const context = useContext(OtpContext);
  if (!context) {
    throw new Error('useOtp must be used within OtpProvider');
  }
  return context;
}

