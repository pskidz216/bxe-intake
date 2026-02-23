import { B } from '../theme';

export default function GlassCard({ children, style = {}, padding = 24 }) {
  return (
    <div style={{
      background: B.glassStrong,
      backdropFilter: B.blur,
      WebkitBackdropFilter: B.blur,
      border: `1px solid ${B.glassBorder}`,
      borderRadius: B.radiusLg,
      boxShadow: B.shadow,
      padding,
      ...style,
    }}>
      {children}
    </div>
  );
}
