import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { B, font, inputStyle, selectStyle } from '../theme';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { SECTIONS, APP_STATUS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

export default function AdminDashboardPage({ adminHook }) {
  const navigate = useNavigate();
  const {
    applications,
    loading,
    error,
    statusFilter,
    searchQuery,
    setStatusFilter,
    setSearchQuery,
    loadAllApplications,
  } = adminHook;

  useEffect(() => {
    loadAllApplications();
  }, [loadAllApplications]);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    ...Object.entries(APP_STATUS).map(([, value]) => ({
      value,
      label: value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    })),
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: B.text, fontFamily: font, margin: 0 }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: 14, color: B.textMuted, fontFamily: font, marginTop: 4 }}>
          Review and manage all intake applications
        </p>
      </div>

      {/* Filters */}
      <GlassCard style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ ...selectStyle, maxWidth: 200, padding: '8px 36px 8px 12px', fontSize: 13 }}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by company name..."
            style={{ ...inputStyle, maxWidth: 300, padding: '8px 12px', fontSize: 13 }}
          />
          <button
            onClick={loadAllApplications}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              color: B.white,
              background: B.orange,
              border: 'none',
              borderRadius: B.radiusSm,
              cursor: 'pointer',
              fontFamily: font,
            }}
          >
            Search
          </button>
          <span style={{ fontSize: 12, color: B.textMuted, fontFamily: font, marginLeft: 'auto' }}>
            {applications.length} application{applications.length !== 1 ? 's' : ''}
          </span>
        </div>
      </GlassCard>

      {/* Error */}
      {error && (
        <GlassCard style={{ marginBottom: 16, background: B.redSoft, border: `1px solid ${B.red}` }}>
          <div style={{ fontSize: 13, color: B.red, fontFamily: font }}>{error}</div>
        </GlassCard>
      )}

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{
            width: 32, height: 32, border: `3px solid ${B.border}`,
            borderTopColor: B.orange, borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <div style={{ fontSize: 14, color: B.textMuted, fontFamily: font }}>Loading applications...</div>
        </div>
      ) : applications.length === 0 ? (
        <GlassCard style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: B.text, fontFamily: font, marginBottom: 4 }}>
            No applications found
          </h2>
          <p style={{ fontSize: 14, color: B.textMuted, fontFamily: font }}>
            {statusFilter !== 'all' || searchQuery
              ? 'Try adjusting your filters.'
              : 'No applications have been submitted yet.'}
          </p>
        </GlassCard>
      ) : (
        <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ background: B.orangeSoft, borderBottom: `1px solid ${B.border}` }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: B.textSecondary, fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Company
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: B.textSecondary, fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: B.textSecondary, fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sections
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: B.textSecondary, fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Submitted
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: B.textSecondary, fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Deadline
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, i) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/admin/review/${app.id}`)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: `1px solid ${B.borderLight}`,
                      background: i % 2 === 0 ? B.white : B.bgSolid,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = B.orangeSofter}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? B.white : B.bgSolid}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: B.text, fontFamily: font }}>
                      {app.company_name || 'Untitled'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: B.textSecondary, fontFamily: font, textAlign: 'center' }}>
                      —/{SECTIONS.length}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: B.textSecondary, fontFamily: font }}>
                      {app.submitted_at ? formatDate(app.submitted_at) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: B.textSecondary, fontFamily: font }}>
                      {app.expires_at ? formatDate(app.expires_at) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
