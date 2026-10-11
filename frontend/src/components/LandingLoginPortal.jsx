import React from 'react';
import Login from './Login';

export const LandingLoginPortal = ({ onLoginSuccess }) => {
  return <Login onLoginSuccess={onLoginSuccess} />;
};

export default LandingLoginPortal;
