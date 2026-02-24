import { B, font } from '../theme';
import { SECTIONS, STATUS_DISPLAY } from '../utils/constants';

export default function SectionNav({ sections, currentSection, onSelect, isMobile }) {
  const getStatusForKey = (key) => {
    const s = sections.find(sec => sec.section_key === key);
    return s ? s.status : 'not_started';
  };

  const completedCount = sections.filter(s =>
    s.status === 'submitted' || s.status === 'accepted'
  ).length;

  if (isMobile) {
    return (
      <nav style={{
        width: '100%',
        padding: '10px 12px',
        borderBottom: `1px solid ${B.border}`,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        gap: 6,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.30)',
        backdropFilter: B.blurSm,
        WebkitBackdropFilter: B.blurSm,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '6px 10px', borderRadius: 16,
          background: B.orangeSoft, whiteSpace: 'nowrap',
          fontSize: 10, fontWeight: 700, color: B.orange,
          flexShrink: 0, fontFamily: font,
        }}>
          {completedCount}/{SECTIONS.length}
        </div>
        {SECTIONS.map(sec => {
          const status = getStatusForKey(sec.key);
          const isActive = currentSection === sec.key;
          const isDone = status === 'submitted' || status === 'accepted';
          return (
            <button
              key={sec.key}
              onClick={() => onSelect(sec.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 12px', borderRadius: 16,
                border: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                background: isActive ? B.orangeSoft : 'rgba(255,255,255,0.50)',
                color: isActive ? B.orange : isDone ? B.green : B.textSecondary,
                fontSize: 11, fontWeight: isActive ? 700 : 500,
                cursor: 'pointer', fontFamily: font,
                transition: 'background 0.15s',
              }}
            >
              {isDone ? '\u2713' : sec.number}. {sec.label}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav style={{
      width: 260,
      minWidth: 260,
      padding: '20px 0',
      borderRight: `1px solid ${B.border}`,
      overflowY: 'auto',
    }}>
      <div style={{
        padding: '0 16px 16px',
        borderBottom: `1px solid ${B.borderLight}`,
        marginBottom: 8,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: B.textMuted, fontFamily: font, marginBottom: 4 }}>
          PROGRESS
        </div>
        <div style={{ fontSize: 13, color: B.text, fontFamily: font }}>
          {completedCount} of {SECTIONS.length} sections complete
        </div>
        <div style={{
          marginTop: 8, height: 4, background: B.border, borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            width: `${(completedCount / SECTIONS.length) * 100}%`,
            height: '100%',
            background: completedCount === SECTIONS.length
              ? B.green
              : `linear-gradient(90deg, ${B.orange}, ${B.orangeLight})`,
            borderRadius: 2,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {SECTIONS.map(sec => {
        const status = getStatusForKey(sec.key);
        const display = STATUS_DISPLAY[status];
        const isActive = currentSection === sec.key;

        return (
          <button
            key={sec.key}
            onClick={() => onSelect(sec.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: isActive ? B.orangeSoft : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              borderLeft: isActive ? `3px solid ${B.orange}` : '3px solid transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = B.orangeSofter; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: '50%', fontSize: 11,
              fontWeight: 700, fontFamily: font,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? B.orange : status === 'submitted' || status === 'accepted' ? B.green : B.border,
              color: isActive || status === 'submitted' || status === 'accepted' ? B.white : B.textMuted,
            }}>
              {status === 'submitted' || status === 'accepted' ? '\u2713' : sec.number}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                color: isActive ? B.orange : B.text, fontFamily: font,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {sec.label}
              </div>
              {status !== 'not_started' && (
                <div style={{
                  fontSize: 10, fontWeight: 600, color: display.color,
                  fontFamily: font, marginTop: 1,
                }}>
                  {display.label}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
