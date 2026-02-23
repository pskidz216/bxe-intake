import { useState, useEffect } from 'react';
import { B, font, inputStyle, labelStyle, buttonPrimary, buttonSecondary } from '../theme';
import BXELogo from '../components/BXELogo';
import GlassCard from '../components/GlassCard';

export default function AuthPage({ auth }) {
  const {
    authError, authMessage, setAuthError, setAuthMessage,
    signUp, signIn, resetPassword,
    mfaRequired, mfaEnrolling, mfaQrUri,
    verifyMfa, enrollMfa, confirmMfaEnrollment,
  } = auth;

  const [mode, setMode] = useState('login'); // login | register | reset | mfa_verify | mfa_enroll
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Switch to MFA modes when needed
  useEffect(() => {
    if (mfaRequired) setMode('mfa_verify');
    if (mfaEnrolling) setMode('mfa_enroll');
  }, [mfaRequired, mfaEnrolling]);

  // Start MFA enrollment
  useEffect(() => {
    if (mode === 'mfa_enroll' && !mfaQrUri) {
      enrollMfa();
    }
  }, [mode, mfaQrUri, enrollMfa]);

  const switchMode = (m) => {
    setMode(m);
    setAuthError('');
    setAuthMessage('');
    setMfaCode('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'login') {
      const result = await signIn(email, password);
      if (result === 'mfa_required') {
        // Mode will be set by useEffect
      } else if (result === 'mfa_enroll') {
        // Mode will be set by useEffect
      }
    } else if (mode === 'register') {
      const ok = await signUp(email, password, fullName, companyName);
      if (ok) setMode('login');
    } else if (mode === 'reset') {
      await resetPassword(email);
    } else if (mode === 'mfa_verify') {
      await verifyMfa(mfaCode);
    } else if (mode === 'mfa_enroll') {
      await confirmMfaEnrollment(mfaCode);
    }

    setLoading(false);
  };

  const renderMfaEnroll = () => (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: B.text, marginBottom: 8, fontFamily: font }}>
        Set Up Two-Factor Authentication
      </h2>
      <p style={{ fontSize: 13, color: B.textSecondary, marginBottom: 20, fontFamily: font, lineHeight: 1.5 }}>
        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code below.
      </p>
      {mfaQrUri && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaQrUri)}`}
            alt="MFA QR Code"
            style={{ borderRadius: B.radiusSm, border: `1px solid ${B.border}` }}
            width={200}
            height={200}
          />
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Verification Code</label>
        <input
          type="text"
          value={mfaCode}
          onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          style={{ ...inputStyle, textAlign: 'center', fontSize: 20, letterSpacing: '0.3em', fontWeight: 600 }}
          maxLength={6}
          autoFocus
        />
      </div>
    </>
  );

  const renderMfaVerify = () => (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: B.text, marginBottom: 8, fontFamily: font }}>
        Two-Factor Verification
      </h2>
      <p style={{ fontSize: 13, color: B.textSecondary, marginBottom: 20, fontFamily: font }}>
        Enter the 6-digit code from your authenticator app.
      </p>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Verification Code</label>
        <input
          type="text"
          value={mfaCode}
          onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          style={{ ...inputStyle, textAlign: 'center', fontSize: 20, letterSpacing: '0.3em', fontWeight: 600 }}
          maxLength={6}
          autoFocus
        />
      </div>
    </>
  );

  const renderForm = () => {
    if (mode === 'mfa_enroll') return renderMfaEnroll();
    if (mode === 'mfa_verify') return renderMfaVerify();

    return (
      <>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: B.text, marginBottom: 4, fontFamily: font }}>
          {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Reset Password'}
        </h2>
        <p style={{ fontSize: 13, color: B.textMuted, marginBottom: 20, fontFamily: font }}>
          {mode === 'login'
            ? 'Sign in to your BXE Intake Portal account'
            : mode === 'register'
              ? 'Create an account to start your application'
              : 'Enter your email to receive a reset link'}
        </p>

        {mode === 'register' && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                style={inputStyle}
              />
            </div>
          </>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={inputStyle}
          />
        </div>

        {mode !== 'reset' && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
              style={inputStyle}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <BXELogo size={40} />
          <h1 style={{ fontSize: 24, fontWeight: 800, color: B.text, marginTop: 12, fontFamily: font }}>
            BXE Intake Portal
          </h1>
          <p style={{ fontSize: 14, color: B.textMuted, marginTop: 4, fontFamily: font }}>
            Investment & Strategic Partnership Applications
          </p>
        </div>

        <GlassCard padding={32}>
          <form onSubmit={handleSubmit}>
            {renderForm()}

            {authError && (
              <div style={{
                padding: '10px 14px', borderRadius: B.radiusSm, background: B.redSoft,
                color: B.red, fontSize: 13, marginBottom: 12, fontFamily: font,
              }}>
                {authError}
              </div>
            )}

            {authMessage && (
              <div style={{
                padding: '10px 14px', borderRadius: B.radiusSm, background: B.greenSoft,
                color: B.green, fontSize: 13, marginBottom: 12, fontFamily: font,
              }}>
                {authMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonPrimary,
                width: '100%',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? 'Please wait...'
                : mode === 'login' ? 'Sign In'
                  : mode === 'register' ? 'Create Account'
                    : mode === 'reset' ? 'Send Reset Link'
                      : mode === 'mfa_verify' ? 'Verify'
                        : 'Confirm & Activate'
              }
            </button>
          </form>

          {/* Mode switchers */}
          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              {mode === 'login' && (
                <>
                  <button
                    onClick={() => switchMode('register')}
                    style={{ background: 'none', border: 'none', color: B.orange, fontSize: 13, cursor: 'pointer', fontFamily: font }}
                  >
                    Don't have an account? Sign up
                  </button>
                  <br />
                  <button
                    onClick={() => switchMode('reset')}
                    style={{ background: 'none', border: 'none', color: B.textMuted, fontSize: 12, cursor: 'pointer', fontFamily: font, marginTop: 8 }}
                  >
                    Forgot password?
                  </button>
                </>
              )}
              {mode === 'register' && (
                <button
                  onClick={() => switchMode('login')}
                  style={{ background: 'none', border: 'none', color: B.orange, fontSize: 13, cursor: 'pointer', fontFamily: font }}
                >
                  Already have an account? Sign in
                </button>
              )}
              {mode === 'reset' && (
                <button
                  onClick={() => switchMode('login')}
                  style={{ background: 'none', border: 'none', color: B.orange, fontSize: 13, cursor: 'pointer', fontFamily: font }}
                >
                  Back to sign in
                </button>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
