import { B, font } from '../theme';

export default function ProgressBar({ value, max = 10, label = '' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div>
      {label && (
        <div style={{ fontSize: 12, color: B.textMuted, marginBottom: 6, fontFamily: font }}>
          {label} ({pct}%)
        </div>
      )}
      <div style={{
        width: '100%',
        height: 6,
        background: B.border,
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: pct === 100
            ? B.green
            : `linear-gradient(90deg, ${B.orange}, ${B.orangeLight})`,
          borderRadius: 3,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}
