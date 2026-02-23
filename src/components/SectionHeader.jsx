import { B, font } from '../theme';
import StatusBadge from './StatusBadge';
import { formatRelativeTime } from '../utils/formatters';

export default function SectionHeader({ title, description, status, saving, lastSaved }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: B.text, fontFamily: font, margin: 0 }}>
          {title}
        </h2>
        <StatusBadge status={status} />
      </div>
      {description && (
        <p style={{ fontSize: 14, color: B.textMuted, margin: 0, marginBottom: 8 }}>
          {description}
        </p>
      )}
      <div style={{ fontSize: 12, color: B.textDim, fontFamily: font }}>
        {saving
          ? 'Saving...'
          : lastSaved
            ? `Last saved ${formatRelativeTime(lastSaved)}`
            : 'Not saved yet'
        }
      </div>
    </div>
  );
}
