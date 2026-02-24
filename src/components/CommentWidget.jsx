import { useState, useRef, useEffect } from 'react';
import { useComments } from '../hooks/useComments';

const ORANGE = '#E8871E';
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CommentWidget({ appId }) {
  const { comments, loading, addComment, toggleResolved, deleteComment, openCount } = useComments(appId);
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState('open');
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [context, setContext] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef(null);
  const textRef = useRef(null);

  // Focus textarea when form opens
  useEffect(() => {
    if (showForm && textRef.current) {
      textRef.current.focus();
    }
  }, [showForm]);

  const filtered = comments.filter(c => c.status === tab);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    const ok = await addComment(text.trim(), context.trim());
    if (ok) {
      setText('');
      setContext('');
      setShowForm(false);
      setTab('open');
    }
    setSubmitting(false);
  };

  // Floating button
  const button = (
    <button
      onClick={() => setIsOpen(!isOpen)}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 10000,
        width: 52,
        height: 52,
        borderRadius: '50%',
        border: 'none',
        background: `linear-gradient(135deg, ${ORANGE}, #F5A623)`,
        color: '#fff',
        fontSize: 22,
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(232,135,30,0.4), 0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.08)';
        e.currentTarget.style.boxShadow = '0 6px 28px rgba(232,135,30,0.5), 0 3px 12px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(232,135,30,0.4), 0 2px 8px rgba(0,0,0,0.15)';
      }}
    >
      {isOpen ? '\u2715' : '\uD83D\uDCAC'}
      {!isOpen && openCount > 0 && (
        <span style={{
          position: 'absolute', top: -4, right: -4,
          background: '#EF4444', color: '#fff',
          fontSize: 11, fontWeight: 700,
          minWidth: 20, height: 20,
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 5px',
          border: '2px solid #fff',
        }}>
          {openCount}
        </span>
      )}
    </button>
  );

  // Panel
  const panel = isOpen ? (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        bottom: 86,
        right: 24,
        zIndex: 10000,
        width: 360,
        maxHeight: 'calc(100vh - 140px)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 16,
        border: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 12px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT,
        overflow: 'hidden',
        animation: 'commentSlideUp 0.25s ease',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 18px 12px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{'\uD83D\uDCAC'}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>Comments</span>
        </div>
        <button
          onClick={() => { setShowForm(true); setTab('open'); }}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
            background: ORANGE,
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: FONT,
          }}
        >
          + Add
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        padding: '0 18px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        {['open', 'resolved'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'none',
              fontSize: 12,
              fontWeight: 600,
              color: tab === t ? ORANGE : '#9CA3AF',
              borderBottom: tab === t ? `2px solid ${ORANGE}` : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: FONT,
              textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}
          >
            {t} ({comments.filter(c => c.status === t).length})
          </button>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: 'rgba(249,250,251,0.8)',
        }}>
          <input
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Page / section (optional)"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              fontSize: 12,
              fontFamily: FONT,
              marginBottom: 8,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = ORANGE}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
          <textarea
            ref={textRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What needs to change?"
            rows={3}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              fontSize: 13,
              fontFamily: FONT,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = ORANGE}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => { setShowForm(false); setText(''); setContext(''); }}
              style={{
                flex: 1, padding: '8px', borderRadius: 8,
                border: '1px solid #E5E7EB', background: '#fff',
                fontSize: 12, fontWeight: 600, color: '#6B7280',
                cursor: 'pointer', fontFamily: FONT,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !text.trim()}
              style={{
                flex: 1, padding: '8px', borderRadius: 8,
                border: 'none',
                background: text.trim() ? ORANGE : '#D1D5DB',
                color: '#fff',
                fontSize: 12, fontWeight: 600,
                cursor: text.trim() ? 'pointer' : 'default',
                fontFamily: FONT,
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 6 }}>
            Tip: Cmd+Enter to save quickly
          </div>
        </div>
      )}

      {/* Comment list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 0',
      }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            {tab === 'open' ? 'No open comments' : 'No resolved comments'}
          </div>
        ) : (
          filtered.map(c => (
            <div
              key={c.id}
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {c.page_context && (
                <div style={{
                  fontSize: 11, fontWeight: 600, color: ORANGE,
                  marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {'\uD83D\uDCCD'} {c.page_context}
                </div>
              )}
              <div style={{
                fontSize: 13, color: '#1F2937', lineHeight: 1.5,
                textDecoration: c.status === 'resolved' ? 'line-through' : 'none',
                opacity: c.status === 'resolved' ? 0.6 : 1,
              }}>
                {c.comment}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 8,
              }}>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                  {c.created_by_email?.split('@')[0]} &middot; {timeAgo(c.created_at)}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => toggleResolved(c.id, c.status)}
                    style={{
                      padding: '4px 10px', borderRadius: 6,
                      border: '1px solid #E5E7EB', background: '#fff',
                      fontSize: 11, fontWeight: 600,
                      color: c.status === 'open' ? '#10B981' : '#6B7280',
                      cursor: 'pointer', fontFamily: FONT,
                    }}
                  >
                    {c.status === 'open' ? '\u2713 Done' : '\u21BA Reopen'}
                  </button>
                  <button
                    onClick={() => deleteComment(c.id)}
                    style={{
                      padding: '4px 8px', borderRadius: 6,
                      border: '1px solid #E5E7EB', background: '#fff',
                      fontSize: 11, color: '#EF4444',
                      cursor: 'pointer', fontFamily: FONT,
                    }}
                  >
                    {'\uD83D\uDDD1'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Animation style */}
      <style>{`
        @keyframes commentSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  ) : null;

  return (
    <>
      {panel}
      {button}
    </>
  );
}
