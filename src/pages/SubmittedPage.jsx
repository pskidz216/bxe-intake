import { useNavigate } from 'react-router-dom';
import { B, font, buttonPrimary, buttonSecondary } from '../theme';
import GlassCard from '../components/GlassCard';
import BXELogo from '../components/BXELogo';

export default function SubmittedPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <GlassCard style={{ maxWidth: 520, textAlign: 'center', padding: '48px 40px' }}>
        <div style={{ marginBottom: 20 }}>
          <BXELogo size={36} />
        </div>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: `linear-gradient(135deg, ${B.green}, #22C55E)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 28, color: B.white,
        }}>
          &#10003;
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: B.text, fontFamily: font, marginBottom: 8 }}>
          Application Submitted
        </h1>
        <p style={{ fontSize: 14, color: B.textSecondary, fontFamily: font, lineHeight: 1.6, marginBottom: 24 }}>
          Thank you for submitting your application to the BXE ecosystem.
          Our team will review your submission and you will be notified
          of any updates or requests via email.
        </p>
        <div style={{
          padding: '12px 16px',
          background: B.blueSoft,
          borderRadius: B.radiusSm,
          marginBottom: 24,
        }}>
          <p style={{ fontSize: 13, color: B.blue, fontFamily: font, margin: 0 }}>
            You can track the status of your application from your dashboard.
            If our team needs additional information, you will see update requests there.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ ...buttonPrimary, padding: '12px 32px' }}
        >
          Return to Dashboard
        </button>
      </GlassCard>
    </div>
  );
}
