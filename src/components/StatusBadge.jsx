import { STATUS_DISPLAY } from '../utils/constants';
import { font } from '../theme';

export default function StatusBadge({ status, style = {} }) {
  const display = STATUS_DISPLAY[status] || { label: status, color: '#9A9AB0', bg: 'rgba(154,154,176,0.08)' };

  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: font,
      color: display.color,
      background: display.bg,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {display.label}
    </span>
  );
}
