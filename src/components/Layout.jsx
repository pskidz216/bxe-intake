import { Link, useLocation, useNavigate } from 'react-router-dom';
import { B, font } from '../theme';
import BXELogo from './BXELogo';

export default function Layout({ children, user, onSignOut, isAdmin, isPublic }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const navLinkStyle = (active) => ({
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    color: active ? B.orange : B.textSecondary,
    fontFamily: font,
    textDecoration: 'none',
    padding: '4px 10px',
    borderRadius: B.radiusSm,
    background: active ? B.orangeSofter : 'transparent',
    transition: 'background 0.15s, color 0.15s',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 56,
        background: B.glassStrong,
        backdropFilter: B.blurSm,
        WebkitBackdropFilter: B.blurSm,
        borderBottom: `1px solid ${B.glassBorder}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BXELogo size={24} />
          <span style={{
            fontSize: 14, fontWeight: 700, color: B.text, fontFamily: font,
            letterSpacing: '0.02em',
          }}>
            Intake Portal
          </span>

          {/* Admin navigation — only show when logged in as admin */}
          {isAdmin && user && (
            <>
              <div style={{
                width: 1, height: 20,
                background: B.border, margin: '0 8px',
              }} />
              <Link
                to="/admin"
                style={navLinkStyle(isAdminRoute)}
                onMouseEnter={e => { if (!isAdminRoute) e.currentTarget.style.background = B.orangeSofter; }}
                onMouseLeave={e => { if (!isAdminRoute) e.currentTarget.style.background = 'transparent'; }}
              >
                Admin Dashboard
              </Link>
              <Link
                to="/dashboard"
                style={navLinkStyle(!isAdminRoute && location.pathname.startsWith('/dashboard'))}
                onMouseEnter={e => { if (isAdminRoute) e.currentTarget.style.background = B.orangeSofter; }}
                onMouseLeave={e => { if (isAdminRoute) e.currentTarget.style.background = 'transparent'; }}
              >
                My Applications
              </Link>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Public mode — show admin login link */}
          {isPublic && !user && (
            <button
              onClick={() => navigate('/admin-login')}
              style={{
                padding: '5px 14px',
                fontSize: 12,
                fontWeight: 500,
                color: B.textMuted,
                background: 'transparent',
                border: `1px solid ${B.border}`,
                borderRadius: B.radiusSm,
                cursor: 'pointer',
                fontFamily: font,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = B.orangeSofter}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Admin Login
            </button>
          )}

          {/* Authenticated user info */}
          {user && (
            <>
              {isAdmin && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: B.orange, fontFamily: font,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: '2px 8px', borderRadius: 20, background: B.orangeSoft,
                }}>
                  Admin
                </span>
              )}
              <span style={{ fontSize: 13, color: B.textSecondary, fontFamily: font }}>
                {user.email}
              </span>
              <button
                onClick={onSignOut}
                style={{
                  padding: '5px 14px',
                  fontSize: 12,
                  fontWeight: 500,
                  color: B.textMuted,
                  background: 'transparent',
                  border: `1px solid ${B.border}`,
                  borderRadius: B.radiusSm,
                  cursor: 'pointer',
                  fontFamily: font,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = B.orangeSofter}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: 24 }}>
        {children}
      </main>
    </div>
  );
}
