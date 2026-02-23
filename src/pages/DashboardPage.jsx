import { useNavigate } from 'react-router-dom';
import { B, font, buttonPrimary } from '../theme';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import DeadlineBanner from '../components/DeadlineBanner';
import ProgressBar from '../components/ProgressBar';
import { SECTIONS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

export default function DashboardPage({ applications, sections, loading, onCreateApp }) {
  const navigate = useNavigate();

  const handleCreate = async () => {
    const app = await onCreateApp();
    if (app) navigate(`/application/${app.id}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: 16, color: B.textMuted, fontFamily: font }}>Loading your applications...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: B.text, fontFamily: font, margin: 0 }}>
            My Applications
          </h1>
          <p style={{ fontSize: 14, color: B.textMuted, fontFamily: font, marginTop: 4 }}>
            Submit applications for investment, M&A, or strategic partnership
          </p>
        </div>
        <button onClick={handleCreate} style={buttonPrimary}>
          + New Application
        </button>
      </div>

      {applications.length === 0 ? (
        <GlassCard style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>&#128203;</div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: B.text, fontFamily: font, marginBottom: 8 }}>
            No applications yet
          </h2>
          <p style={{ fontSize: 14, color: B.textMuted, fontFamily: font, marginBottom: 20 }}>
            Start your first application to join the BXE ecosystem.
          </p>
          <button onClick={handleCreate} style={buttonPrimary}>
            Start Application
          </button>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {applications.map(app => {
            const completedSections = (app._sections || []).filter(
              s => s.status === 'submitted' || s.status === 'accepted'
            ).length;

            return (
              <GlassCard key={app.id} padding={20}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: B.text, fontFamily: font, margin: 0 }}>
                        {app.company_name || 'Untitled Application'}
                      </h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <div style={{ fontSize: 12, color: B.textMuted, fontFamily: font, marginBottom: 10 }}>
                      Started {formatDate(app.created_at)}
                      {app.submitted_at && ` · Submitted ${formatDate(app.submitted_at)}`}
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ flex: 1, maxWidth: 200 }}>
                        <ProgressBar value={completedSections} max={SECTIONS.length} />
                      </div>
                      <DeadlineBanner expiresAt={app.expires_at} />
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/application/${app.id}`)}
                    disabled={app.status === 'expired' || app.status === 'disqualified'}
                    style={{
                      ...buttonPrimary,
                      opacity: app.status === 'expired' || app.status === 'disqualified' ? 0.5 : 1,
                      cursor: app.status === 'expired' || app.status === 'disqualified' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {app.status === 'submitted' ? 'View' : app.status === 'expired' || app.status === 'disqualified' ? 'Locked' : 'Continue'}
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
