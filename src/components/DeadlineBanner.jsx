import { B, font } from '../theme';
import { useDeadline } from '../hooks/useDeadline';

export default function DeadlineBanner({ expiresAt }) {
  const { daysLeft, isExpired, color, urgency } = useDeadline(expiresAt);

  if (daysLeft === null) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 16px',
      background: isExpired ? B.redSoft : urgency === 'critical' ? B.redSoft : urgency === 'warning' ? B.orangeSoft : B.blueSoft,
      borderRadius: B.radiusSm,
      border: `1px solid ${color}20`,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: color,
        animation: urgency === 'critical' || isExpired ? 'pulse 2s infinite' : 'none',
      }} />
      <span style={{ fontSize: 13, fontWeight: 500, color, fontFamily: font }}>
        {isExpired
          ? 'Application expired'
          : daysLeft === 0
            ? 'Expires today'
            : daysLeft === 1
              ? '1 day remaining'
              : `${daysLeft} days remaining`
        }
      </span>
    </div>
  );
}
