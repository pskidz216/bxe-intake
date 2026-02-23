import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useApplication } from './hooks/useApplication';
import { useAdmin } from './hooks/useAdmin';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ApplicationPage from './pages/ApplicationPage';
import PublicApplicationPage from './pages/PublicApplicationPage';
import SubmittedPage from './pages/SubmittedPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminReviewPage from './pages/AdminReviewPage';
import { B, font } from './theme';

// Wrapper component so useAdmin is only called when admin routes render
function AdminRoutes({ user }) {
  const adminHook = useAdmin();
  return (
    <Routes>
      <Route path="/" element={<AdminDashboardPage adminHook={adminHook} />} />
      <Route path="/review/:id" element={<AdminReviewPage adminHook={adminHook} user={user} />} />
    </Routes>
  );
}

export default function App() {
  const auth = useAuth();
  const { user, session, loading, signOut, mfaRequired, mfaEnrolling, isAdmin } = auth;
  const appHook = useApplication(user);

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 32, height: 32, border: `3px solid ${B.border}`,
            borderTopColor: B.orange, borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <div style={{ fontSize: 14, color: B.textMuted, fontFamily: font }}>Loading...</div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // PUBLIC ROUTES — no auth required
  // The default experience is the public form wizard.
  // Users fill out the entire application without signing in.
  // Auth is only required at submission time.
  // ──────────────────────────────────────────────

  // If admin route is requested and user is not authenticated, show admin login
  // If regular user routes requested and user not authenticated, show public form

  return (
    <Routes>
      {/* ── Public form wizard (default for unauthenticated users) ── */}
      <Route path="/" element={
        <Layout user={user} onSignOut={signOut} isAdmin={isAdmin} isPublic={!user}>
          <PublicApplicationPage user={user} auth={auth} />
        </Layout>
      } />

      {/* ── Admin login page ── */}
      <Route path="/admin-login" element={
        !user || mfaRequired || mfaEnrolling
          ? <AuthPage auth={auth} />
          : <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
      } />

      {/* ── Auth page (standalone for direct access) ── */}
      <Route path="/auth" element={
        !user || mfaRequired || mfaEnrolling
          ? <AuthPage auth={auth} />
          : <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
      } />

      {/* ── Authenticated routes ── */}
      {user && !mfaRequired && !mfaEnrolling && (
        <>
          {/* Dashboard — shows user's submitted applications */}
          <Route path="/dashboard" element={
            <Layout user={user} onSignOut={signOut} isAdmin={isAdmin}>
              <DashboardPage
                applications={appHook.applications}
                loading={appHook.loading}
                onCreateApp={appHook.createApplication}
              />
            </Layout>
          } />

          {/* Application detail — for viewing/editing saved applications */}
          <Route path="/application/:id" element={
            <Layout user={user} onSignOut={signOut} isAdmin={isAdmin}>
              <ApplicationPage appHook={appHook} user={user} />
            </Layout>
          } />

          {/* Admin routes */}
          {isAdmin && (
            <Route path="/admin/*" element={
              <Layout user={user} onSignOut={signOut} isAdmin={isAdmin}>
                <AdminRoutes user={user} />
              </Layout>
            } />
          )}
        </>
      )}

      {/* ── Submitted page — allow even if just authenticated ── */}
      <Route path="/submitted/:id" element={
        <Layout user={user} onSignOut={signOut} isAdmin={isAdmin} isPublic={!user}>
          <SubmittedPage />
        </Layout>
      } />

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
