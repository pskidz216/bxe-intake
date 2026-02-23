import { useState, useEffect, useCallback } from 'react';
import { B, font, inputStyle, labelStyle, buttonPrimary, buttonSecondary } from '../theme';
import GlassCard from './GlassCard';
import BXELogo from './BXELogo';
import { supabase } from '../lib/supabase';

/**
 * AuthModal — a full-screen overlay for authentication at submit time.
 * Supports: register (default), login, MFA enroll, MFA verify.
 * On successful auth, calls onSuccess(user) so the parent can persist data.
 */
export default function AuthModal({ auth, onSuccess, onClose }) {
  const {
    authError, authMessage, setAuthError, setAuthMessage,
    mfaRequired, mfaEnrolling, mfaQrUri,
    verifyMfa, enrollMfa, confirmMfaEnrollment,
  } = auth;

  const [mode, setMode] = useState('register'); // register | login | reset | mfa_verify | mfa_enroll
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [waitingForVerification, setWaitingForVerification] = useState(false);

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

  // Listen for auth state changes — when user is fully authenticated, call onSuccess
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if MFA is complete (if applicable)
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.currentLevel === 'aal2' || aal?.currentLevel === 'aal1') {
          // Fully authenticated
          onSuccess(session.user);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [onSuccess]);

  const switchMode = (m) => {
    setMode(m);
    setAuthError('');
    setAuthMessage('');
    setMfaCode('');
    setWaitingForVerification(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, company_name: companyName },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setAuthError(error.message);
        setLoading(false);
        return;
      }

      if (data?.user?.identities?.length === 0) {
        setAuthError('An account with this email already exists. Try signing in.');
        setLoading(false);
        return;
      }

      // For new Supabase projects, email confirmation may be disabled
      // Check if user session was created immediately
      if (data?.session?.user) {
        // No email verification required — check MFA
        const mfaStatus = await auth.checkMfaStatus();
        if (!mfaStatus.enrolled) {
          setMode('mfa_enroll');
          setLoading(false);
          return;
        }
        onSuccess(data.session.user);
      } else {
        // Email verification required
        setAuthMessage('Check your email for a verification link! Once verified, sign in below.');
        setWaitingForVerification(true);
      }
    } else if (mode === 'login') {
      const result = await auth.signIn(email, password);
      if (result === 'mfa_required') {
        // Mode will be set by useEffect
      } else if (result === 'mfa_enroll') {
        // Mode will be set by useEffect
      } else if (result === true) {
        // Successful sign-in without MFA — onSuccess will be called by auth state listener
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) onSuccess(session.user);
      }
    } else if (mode === 'mfa_verify') {
      const ok = await verifyMfa(mfaCode);
      if (ok) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) onSuccess(session.user);
      }
    } else if (mode === 'mfa_enroll') {
      const ok = await confirmMfaEnrollment(mfaCode);
      if (ok) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) onSuccess(session.user);
      }
    } else if (mode === 'reset') {
      await auth.resetPassword(email);
    }

    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 24,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeUp 0.3s ease' }}>
        <GlassCard padding={32} style={{ background: B.white, boxShadow: B.shadowXl }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'none', border: 'none', fontSize: 20,
              color: B.textMuted, cursor: 'pointer', padding: 4,
            }}
          >
            &#10005;
          </button>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <BXELogo size={32} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: B.text, marginTop: 12, fontFamily: font }}>
              {mode === 'register' ? 'Create Your Account' :
               mode === 'login' ? 'Sign In to Submit' :
               mode === 'mfa_enroll' ? 'Set Up Two-Factor Auth' :
               mode === 'mfa_verify' ? 'Two-Factor Verification' :
               'Reset Password'}
            </h2>
            <p style={{ fontSize: 13, color: B.textMuted, marginTop: 4, fontFamily: font }}>
              {mode === 'register' ? 'Create an account to submit your application. Your progress has been saved.' :
               mode === 'login' ? 'Sign in to your existing account to submit.' :
               mode === 'mfa_enroll' ? 'Scan the QR code with your authenticator app.' :
               mode === 'mfa_verify' ? 'Enter the code from your authenticator app.' :
               'We\'ll send you a reset link.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* MFA Enroll */}
            {mode === 'mfa_enroll' && (
              <>
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
            )}

            {/* MFA Verify */}
            {mode === 'mfa_verify' && (
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
            )}

            {/* Register / Login / Reset forms */}
            {(mode === 'register' || mode === 'login' || mode === 'reset') && (
              <>
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
                        required
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
                    required
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
                      required
                    />
                  </div>
                )}
              </>
            )}

            {/* Error / Message */}
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

            {/* Submit button */}
            {!waitingForVerification && (
              <button
                type="submit"
                disabled={loading}
                style={{ ...buttonPrimary, width: '100%', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Please wait...' :
                 mode === 'register' ? 'Create Account & Submit' :
                 mode === 'login' ? 'Sign In & Submit' :
                 mode === 'mfa_verify' ? 'Verify' :
                 mode === 'mfa_enroll' ? 'Confirm & Activate' :
                 'Send Reset Link'}
              </button>
            )}

            {waitingForVerification && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{ ...buttonPrimary, width: '100%' }}
              >
                I've Verified — Sign In Now
              </button>
            )}
          </form>

          {/* Mode switchers */}
          {(mode === 'register' || mode === 'login' || mode === 'reset') && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              {mode === 'register' && (
                <button
                  onClick={() => switchMode('login')}
                  style={{ background: 'none', border: 'none', color: B.orange, fontSize: 13, cursor: 'pointer', fontFamily: font }}
                >
                  Already have an account? Sign in
                </button>
              )}
              {mode === 'login' && (
                <>
                  <button
                    onClick={() => switchMode('register')}
                    style={{ background: 'none', border: 'none', color: B.orange, fontSize: 13, cursor: 'pointer', fontFamily: font }}
                  >
                    Need an account? Sign up
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
