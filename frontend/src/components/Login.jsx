import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BrandMonogram } from './BrandMonogram';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const { loginUser, registerUser } = useAuth ? useAuth() : {};

  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('Customer'); // 'Customer' | 'Admin'

  // Form states
  const [signInData, setSignInData] = useState({ email: '', password: '', rememberMe: false });
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const errs = {};

    // Standard validation: valid email & minimum password length
    if (!signInData.email || !/\S+@\S+\.\S+/.test(signInData.email)) {
      errs.signInEmail = 'Please enter a valid email address.';
    }
    if (!signInData.password || signInData.password.length < 6) {
      errs.signInPassword = 'Password must be at least 6 characters.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Clear previous errors and proceed directly to portal
    setErrors({});
    setIsSubmitting(true);

    try {
      if (loginUser) {
        const res = await loginUser({
          email: signInData.email.trim(),
          password: signInData.password,
          role: role.toLowerCase(),
          rememberMe: signInData.rememberMe,
        });

        if (res && res.success) {
          if (typeof onLoginSuccess === 'function') {
            onLoginSuccess({
              email: signInData.email,
              role: role, // 'Admin' or 'Customer'
              ...res.data,
            });
          }
        } else {
          setErrors({ signInGeneral: res?.message || 'Login failed.' });
        }
      } else if (typeof onLoginSuccess === 'function') {
        onLoginSuccess({
          email: signInData.email,
          role: role, // 'Admin' or 'Customer'
        });
      }
    } catch (err) {
      setErrors({ signInGeneral: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const errs = {};
    if (!signUpData.firstName.trim()) errs.firstName = 'First name is required.';
    if (!signUpData.email || !/\S+@\S+\.\S+/.test(signUpData.email)) {
      errs.signUpEmail = 'Please enter a valid email address.';
    }
    if (!signUpData.password || signUpData.password.length < 6) {
      errs.signUpPassword = 'Password must be at least 6 characters.';
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    if (!signUpData.agreeTerms) {
      errs.terms = 'You must agree to the terms & conditions.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const fullName = `${signUpData.firstName} ${signUpData.lastName}`.trim();

    try {
      if (registerUser) {
        const res = await registerUser({
          fullName,
          email: signUpData.email.trim(),
          password: signUpData.password,
          role: role.toLowerCase(),
        });

        if (res && res.success) {
          setSuccessMsg('Account created successfully! Please sign in with your credentials.');
          setIsSignUp(false);
          setSignInData((prev) => ({ ...prev, email: signUpData.email }));
        } else {
          setErrors({ signUpGeneral: res?.message || 'Registration failed.' });
        }
      } else if (typeof onLoginSuccess === 'function') {
        onLoginSuccess({ email: signUpData.email, name: fullName, role });
      }
    } catch (err) {
      setErrors({ signUpGeneral: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-root">
      {/* Brand Header with Freestanding Scaled Monogram */}
      <div className="auth-brand-header">
        <BrandMonogram className="auth-brand-logo-img" />
        <div className="auth-brand-text">
          <h1 className="brand-title">StyleStack</h1>
          <p className="brand-tagline">DRESS &amp; CLOTHING HUB</p>
        </div>
      </div>

      {/* Role Pill Switcher */}
      <div className="role-pill-switch">
        <button
          type="button"
          className={`role-btn ${role === 'Customer' ? 'active' : ''}`}
          onClick={() => {
            setRole('Customer');
            setErrors({});
            setSuccessMsg('');
          }}
        >
          Customer
        </button>
        <button
          type="button"
          className={`role-btn ${role === 'Admin' ? 'active' : ''}`}
          onClick={() => {
            setRole('Admin');
            setErrors({});
            setSuccessMsg('');
          }}
        >
          Admin
        </button>
      </div>

      {/* Main Sliding Neumorphic Auth Box */}
      <div className={`embossed-auth-wrapper ${isSignUp ? 'sign-up-active' : ''}`}>
        {/* Sign In Form */}
        <div className="form-panel sign-in-panel">
          <form onSubmit={handleSignInSubmit} noValidate>
            <h2 className="panel-heading">Sign In</h2>
            <p className="panel-subheading">Login with your credentials ({role})</p>

            {successMsg && (
              <div className="auth-status-alert success">
                <span>{successMsg}</span>
              </div>
            )}

            {errors.signInGeneral && (
              <div className="auth-status-alert error">
                <span>{errors.signInGeneral}</span>
              </div>
            )}

            <div className="embossed-input-group">
              <input
                type="email"
                placeholder="Email address"
                value={signInData.email}
                onChange={(e) => {
                  setSignInData({ ...signInData, email: e.target.value });
                  if (errors.signInEmail) setErrors({ ...errors, signInEmail: '' });
                }}
                className={errors.signInEmail ? 'has-error' : ''}
              />
              {errors.signInEmail && <span className="field-error-msg">{errors.signInEmail}</span>}
            </div>

            <div className="embossed-input-group">
              <input
                type="password"
                placeholder="Password"
                value={signInData.password}
                onChange={(e) => {
                  setSignInData({ ...signInData, password: e.target.value });
                  if (errors.signInPassword) setErrors({ ...errors, signInPassword: '' });
                }}
                className={errors.signInPassword ? 'has-error' : ''}
              />
              {errors.signInPassword && <span className="field-error-msg">{errors.signInPassword}</span>}
            </div>

            <div className="auth-form-extras">
              <label className="custom-check-label">
                <input
                  type="checkbox"
                  checked={signInData.rememberMe}
                  onChange={(e) => setSignInData({ ...signInData, rememberMe: e.target.checked })}
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="forgot-pass-link">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="embossed-action-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Authenticating...' : `Login Now (${role})`}
            </button>

            <div className="mobile-switch-helper">
              Don't have an account?
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrors({});
                  setSuccessMsg('');
                }}
              >
                Create Account
              </button>
            </div>
          </form>
        </div>

        {/* Create Account Form */}
        <div className="form-panel sign-up-panel">
          <form onSubmit={handleSignUpSubmit} noValidate>
            <h2 className="panel-heading">Create Account</h2>
            <p className="panel-subheading">Sign up and begin your experience</p>

            {errors.signUpGeneral && (
              <div className="auth-status-alert error">
                <span>{errors.signUpGeneral}</span>
              </div>
            )}

            <div className="input-row-dual">
              <div className="embossed-input-group">
                <input
                  type="text"
                  placeholder="First name"
                  value={signUpData.firstName}
                  onChange={(e) => {
                    setSignUpData({ ...signUpData, firstName: e.target.value });
                    if (errors.firstName) setErrors({ ...errors, firstName: '' });
                  }}
                  className={errors.firstName ? 'has-error' : ''}
                />
              </div>
              <div className="embossed-input-group">
                <input
                  type="text"
                  placeholder="Last name"
                  value={signUpData.lastName}
                  onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                />
              </div>
            </div>
            {errors.firstName && <span className="field-error-msg">{errors.firstName}</span>}

            <div className="embossed-input-group">
              <input
                type="email"
                placeholder="Email address"
                value={signUpData.email}
                onChange={(e) => {
                  setSignUpData({ ...signUpData, email: e.target.value });
                  if (errors.signUpEmail) setErrors({ ...errors, signUpEmail: '' });
                }}
                className={errors.signUpEmail ? 'has-error' : ''}
              />
              {errors.signUpEmail && <span className="field-error-msg">{errors.signUpEmail}</span>}
            </div>

            <div className="embossed-input-group">
              <input
                type="password"
                placeholder="Create password"
                value={signUpData.password}
                onChange={(e) => {
                  setSignUpData({ ...signUpData, password: e.target.value });
                  if (errors.signUpPassword) setErrors({ ...errors, signUpPassword: '' });
                }}
                className={errors.signUpPassword ? 'has-error' : ''}
              />
              {errors.signUpPassword && <span className="field-error-msg">{errors.signUpPassword}</span>}
            </div>

            <div className="embossed-input-group">
              <input
                type="password"
                placeholder="Confirm password"
                value={signUpData.confirmPassword}
                onChange={(e) => {
                  setSignUpData({ ...signUpData, confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                className={errors.confirmPassword ? 'has-error' : ''}
              />
              {errors.confirmPassword && <span className="field-error-msg">{errors.confirmPassword}</span>}
            </div>

            <div className="auth-form-extras terms-box">
              <label className="custom-check-label">
                <input
                  type="checkbox"
                  checked={signUpData.agreeTerms}
                  onChange={(e) => {
                    setSignUpData({ ...signUpData, agreeTerms: e.target.checked });
                    if (errors.terms) setErrors({ ...errors, terms: '' });
                  }}
                />
                <span>I agree to the terms &amp; conditions</span>
              </label>
            </div>
            {errors.terms && <span className="field-error-msg">{errors.terms}</span>}

            <button type="submit" className="embossed-action-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="mobile-switch-helper">
              Already have an account?
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrors({});
                  setSuccessMsg('');
                }}
              >
                Sign In
              </button>
            </div>
          </form>
        </div>

        {/* Sliding Overlay Panels */}
        <div className="sliding-overlay-container">
          <div className="sliding-overlay">
            {/* Overlay Left (Visible when Create Account is active) */}
            <div className="overlay-slide-panel overlay-slide-left">
              <h2 className="overlay-title">Already have an account?</h2>
              <p className="overlay-desc">
                Sign in to continue with the smooth embossed sliding experience.
              </p>
              <button
                type="button"
                className="embossed-ghost-btn"
                onClick={() => {
                  setIsSignUp(false);
                  setErrors({});
                  setSuccessMsg('');
                }}
              >
                Sign In
              </button>
            </div>

            {/* Overlay Right (Visible when Sign In is active) */}
            <div className="overlay-slide-panel overlay-slide-right">
              <h2 className="overlay-title">Hello, Friend!</h2>
              <p className="overlay-desc">
                Enter your details and start your journey with our modern app experience.
              </p>
              <button
                type="button"
                className="embossed-ghost-btn"
                onClick={() => {
                  setIsSignUp(true);
                  setErrors({});
                  setSuccessMsg('');
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
