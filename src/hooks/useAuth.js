import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ADMIN_DOMAINS } from '../utils/constants';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState(null);
  const [mfaQrUri, setMfaQrUri] = useState(null);
  const [mfaEnrolling, setMfaEnrolling] = useState(false);

  // Detect if we're inside the portal iframe
  const isInIframe = window.parent !== window;

  // Listen for portal SSO session via postMessage
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data?.type === 'BXE_PORTAL_SESSION') {
        const { access_token, refresh_token } = event.data;
        if (access_token && refresh_token) {
          try {
            await supabase.auth.setSession({ access_token, refresh_token });
          } catch (e) {
            console.warn('SSO setSession failed:', e);
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);

    // Tell the parent portal we're ready to receive the session
    if (isInIframe) {
      window.parent.postMessage({ type: 'BXE_APP_READY' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      // If in iframe with no local session, wait for portal SSO before showing login
      if (!session && isInIframe) {
        setTimeout(() => setLoading(false), 2000);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if user has MFA enrolled
  const checkMfaStatus = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return { enrolled: false, verified: false };
    const totp = data?.totp || [];
    const verified = totp.filter(f => f.status === 'verified');
    return {
      enrolled: totp.length > 0,
      verified: verified.length > 0,
      factors: totp,
    };
  }, []);

  const signUp = useCallback(async (email, password, fullName, companyName) => {
    setAuthError('');
    setAuthMessage('');

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
      return false;
    }

    if (data?.user?.identities?.length === 0) {
      setAuthError('An account with this email already exists.');
      return false;
    }

    setAuthMessage('Check your email for a verification link! Once verified, you can log in.');
    return true;
  }, []);

  const signIn = useCallback(async (email, password) => {
    setAuthError('');
    setAuthMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setAuthError('Please verify your email before logging in. Check your inbox.');
      } else {
        setAuthError('Invalid email or password.');
      }
      return false;
    }

    // Check MFA status after sign in
    const mfaStatus = await checkMfaStatus();
    if (mfaStatus.verified) {
      // User has MFA — need to verify
      const factors = mfaStatus.factors.filter(f => f.status === 'verified');
      if (factors.length > 0) {
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: factors[0].id,
        });
        if (challengeError) {
          setAuthError('MFA challenge failed. Please try again.');
          return false;
        }
        setMfaRequired(true);
        setMfaFactorId(factors[0].id);
        return 'mfa_required';
      }
    }

    if (!mfaStatus.enrolled) {
      // No MFA enrolled — prompt enrollment
      setMfaEnrolling(true);
      return 'mfa_enroll';
    }

    return true;
  }, [checkMfaStatus]);

  const verifyMfa = useCallback(async (code) => {
    setAuthError('');

    if (!mfaFactorId) {
      setAuthError('No MFA factor found. Please sign in again.');
      return false;
    }

    // Get current challenge
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: mfaFactorId,
    });

    if (challengeError) {
      setAuthError('MFA challenge failed. Please try again.');
      return false;
    }

    const { data, error } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: challenge.id,
      code,
    });

    if (error) {
      setAuthError('Invalid verification code. Please try again.');
      return false;
    }

    setMfaRequired(false);
    setMfaFactorId(null);
    return true;
  }, [mfaFactorId]);

  const enrollMfa = useCallback(async () => {
    setAuthError('');

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'BXE Intake Authenticator',
    });

    if (error) {
      setAuthError('Failed to set up MFA: ' + error.message);
      return false;
    }

    setMfaFactorId(data.id);
    setMfaQrUri(data.totp.uri);
    return data;
  }, []);

  const confirmMfaEnrollment = useCallback(async (code) => {
    setAuthError('');

    if (!mfaFactorId) {
      setAuthError('No MFA factor found. Please try again.');
      return false;
    }

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: mfaFactorId,
    });

    if (challengeError) {
      setAuthError('MFA challenge failed: ' + challengeError.message);
      return false;
    }

    const { data, error } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: challenge.id,
      code,
    });

    if (error) {
      setAuthError('Invalid code. Please check your authenticator app and try again.');
      return false;
    }

    setMfaEnrolling(false);
    setMfaQrUri(null);
    setMfaFactorId(null);
    return true;
  }, [mfaFactorId]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setMfaRequired(false);
    setMfaEnrolling(false);
    setMfaFactorId(null);
    setMfaQrUri(null);
  }, []);

  const resetPassword = useCallback(async (email) => {
    setAuthError('');
    setAuthMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });

    if (error) {
      setAuthError(error.message);
      return false;
    }

    setAuthMessage('Password reset link sent! Check your email inbox.');
    return true;
  }, []);

  // Admin detection based on email domain
  const isAdmin = user?.email && ADMIN_DOMAINS.includes(user.email.split('@')[1]?.toLowerCase());

  return {
    user,
    session,
    loading,
    authError,
    authMessage,
    setAuthError,
    setAuthMessage,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAdmin,
    // MFA
    mfaRequired,
    mfaEnrolling,
    mfaQrUri,
    mfaFactorId,
    verifyMfa,
    enrollMfa,
    confirmMfaEnrollment,
    checkMfaStatus,
  };
}
