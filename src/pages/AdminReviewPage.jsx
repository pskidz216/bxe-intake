import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { B, font, textareaStyle, selectStyle, buttonPrimary, buttonSecondary } from '../theme';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { SECTIONS, APP_STATUS } from '../utils/constants';
import { formatDate, formatRelativeTime, formatFileSize } from '../utils/formatters';
import { supabase } from '../lib/supabase';

export default function AdminReviewPage({ adminHook, user }) {
  const { id: appId } = useParams();
  const navigate = useNavigate();

  const {
    currentSections,
    currentDocuments,
    currentAuditLog,
    error,
    updateApplicationStatus,
    addReviewerNotes,
    loadApplicationSections,
    loadApplicationDocuments,
    loadApplicationAuditLog,
    getDocumentUrl,
  } = adminHook;

  const [app, setApp] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [notesInput, setNotesInput] = useState({});
  const [savingNotes, setSavingNotes] = useState({});
  const [downloadingDoc, setDownloadingDoc] = useState(null);

  const loadApp = useCallback(async () => {
    setLoadingApp(true);
    const { data, error: err } = await supabase
      .from('intake_applications')
      .select('*')
      .eq('id', appId)
      .single();

    if (err) {
      setLoadingApp(false);
      return;
    }

    setApp(data);
    setNewStatus(data.status);
    setLoadingApp(false);

    await Promise.all([
      loadApplicationSections(appId),
      loadApplicationDocuments(appId),
      loadApplicationAuditLog(appId),
    ]);
  }, [appId, loadApplicationSections, loadApplicationDocuments, loadApplicationAuditLog]);

  useEffect(() => {
    loadApp();
  }, [loadApp]);

  useEffect(() => {
    const notes = {};
    currentSections.forEach(s => {
      notes[s.id] = s.reviewer_notes || '';
    });
    setNotesInput(notes);
  }, [currentSections]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === app.status) return;
    setUpdatingStatus(true);
    const success = await updateApplicationStatus(appId, newStatus);
    if (success) {
      setApp(prev => ({ ...prev, status: newStatus }));
    }
    setUpdatingStatus(false);
  };

  const handleSaveNotes = async (sectionId) => {
    setSavingNotes(prev => ({ ...prev, [sectionId]: true }));
    await addReviewerNotes(sectionId, notesInput[sectionId] || '');
    setSavingNotes(prev => ({ ...prev, [sectionId]: false }));
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleDownload = async (doc) => {
    setDownloadingDoc(doc.id);
    const url = await getDocumentUrl(doc.storage_path);
    if (url) window.open(url, '_blank');
    setDownloadingDoc(null);
  };

  const renderDataFields = (data) => {
    if (!data || typeof data !== 'object') {
      return <div style={{ fontSize: 13, color: B.textMuted, fontFamily: font }}>No data recorded</div>;
    }
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <div style={{ fontSize: 13, color: B.textMuted, fontFamily: font }}>No data recorded</div>;
    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px 16px' }}>
        {entries.map(([key, value]) => (
          <div key={key} style={{ display: 'contents' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: B.textSecondary, fontFamily: font, padding: '4px 0', wordBreak: 'break-word' }}>
              {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </div>
            <div style={{ fontSize: 13, color: B.text, fontFamily: font, padding: '4px 0', wordBreak: 'break-word' }}>
              {typeof value === 'object' && value !== null
                ? JSON.stringify(value, null, 2)
                : String(value ?? '—')}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const statusOptions = Object.entries(APP_STATUS).map(([, value]) => ({
    value,
    label: value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  }));

  if (loadingApp) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{
          width: 32, height: 32, border: `3px solid ${B.border}`,
          borderTopColor: B.orange, borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px',
        }} />
        <div style={{ fontSize: 14, color: B.textMuted, fontFamily: font }}>Loading application...</div>
      </div>
    );
  }

  if (!app) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <GlassCard style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: B.text, fontFamily: font, marginBottom: 8 }}>
            Application not found
          </h2>
          <button onClick={() => navigate('/admin')} style={{ ...buttonSecondary, marginTop: 12 }}>
            Back to Dashboard
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Back link */}
      <button
        onClick={() => navigate('/admin')}
        style={{
          background: 'none', border: 'none', color: B.orange,
          fontSize: 13, fontWeight: 600, fontFamily: font,
          cursor: 'pointer', padding: 0, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        ← Back to Dashboard
      </button>

      {/* Header */}
      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: B.text, fontFamily: font, margin: 0 }}>
                {app.company_name || 'Untitled Application'}
              </h1>
              <StatusBadge status={app.status} />
            </div>
            <div style={{ fontSize: 13, color: B.textMuted, fontFamily: font }}>
              Created {formatDate(app.created_at)}
              {app.submitted_at && ` · Submitted ${formatDate(app.submitted_at)}`}
              {app.expires_at && ` · Deadline ${formatDate(app.expires_at)}`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{ ...selectStyle, padding: '8px 36px 8px 12px', fontSize: 13, minWidth: 180 }}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={updatingStatus || newStatus === app.status}
              style={{
                ...buttonPrimary, padding: '8px 16px', fontSize: 13,
                opacity: updatingStatus || newStatus === app.status ? 0.5 : 1,
                cursor: updatingStatus || newStatus === app.status ? 'not-allowed' : 'pointer',
              }}
            >
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Sections accordion */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: B.text, fontFamily: font, marginBottom: 12 }}>
          Sections ({currentSections.filter(s => s.status === 'submitted' || s.status === 'accepted').length}/{SECTIONS.length} complete)
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SECTIONS.map(sectionDef => {
            const section = currentSections.find(s => s.section_key === sectionDef.key);
            if (!section) return null;
            const isExpanded = expandedSections[section.id];

            return (
              <GlassCard key={section.id} style={{ padding: 0 }}>
                <div
                  onClick={() => toggleSection(section.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = B.orangeSofter}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: B.orangeSoft, color: B.orange,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, fontFamily: font,
                    }}>
                      {sectionDef.number}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: B.text, fontFamily: font }}>
                      {sectionDef.label}
                    </span>
                    <StatusBadge status={section.status} />
                  </div>
                  <span style={{
                    fontSize: 16, color: B.textMuted,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}>
                    ▼
                  </span>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${B.borderLight}` }}>
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: B.textMuted, fontFamily: font, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Section Data
                      </div>
                      {renderDataFields(section.data)}
                    </div>

                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${B.borderLight}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: B.textMuted, fontFamily: font, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Reviewer Notes
                      </div>
                      <textarea
                        value={notesInput[section.id] || ''}
                        onChange={(e) => setNotesInput(prev => ({ ...prev, [section.id]: e.target.value }))}
                        placeholder="Add review notes for this section..."
                        style={{ ...textareaStyle, minHeight: 60, marginBottom: 8 }}
                      />
                      <button
                        onClick={() => handleSaveNotes(section.id)}
                        disabled={savingNotes[section.id]}
                        style={{
                          ...buttonSecondary, padding: '6px 14px', fontSize: 12,
                          opacity: savingNotes[section.id] ? 0.5 : 1,
                        }}
                      >
                        {savingNotes[section.id] ? 'Saving...' : 'Save Notes'}
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Documents */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: B.text, fontFamily: font, marginBottom: 12 }}>
          Documents ({currentDocuments.length})
        </h2>
        <GlassCard>
          {currentDocuments.length === 0 ? (
            <div style={{ fontSize: 13, color: B.textMuted, fontFamily: font, textAlign: 'center', padding: 20 }}>
              No documents uploaded
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currentDocuments.map(doc => (
                <div key={doc.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', border: `1px solid ${B.borderLight}`,
                  borderRadius: B.radiusSm, background: B.white,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: B.text, fontFamily: font }}>
                      {doc.file_name}
                    </div>
                    <div style={{ fontSize: 11, color: B.textMuted, fontFamily: font, marginTop: 2 }}>
                      {formatFileSize(doc.file_size)} · {formatDate(doc.uploaded_at)}
                      {doc.checklist_item && ` · ${doc.checklist_item}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingDoc === doc.id}
                    style={{
                      ...buttonSecondary, padding: '5px 12px', fontSize: 11,
                      opacity: downloadingDoc === doc.id ? 0.5 : 1,
                    }}
                  >
                    {downloadingDoc === doc.id ? 'Loading...' : 'Download'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Audit Log */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: B.text, fontFamily: font, marginBottom: 12 }}>
          Audit Log ({currentAuditLog.length})
        </h2>
        <GlassCard>
          {currentAuditLog.length === 0 ? (
            <div style={{ fontSize: 13, color: B.textMuted, fontFamily: font, textAlign: 'center', padding: 20 }}>
              No audit log entries
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {currentAuditLog.map((entry, idx) => (
                <div key={entry.id || idx} style={{
                  display: 'flex', gap: 12, padding: '12px 0',
                  borderBottom: idx < currentAuditLog.length - 1 ? `1px solid ${B.borderLight}` : 'none',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: idx === 0 ? B.orange : B.border, flexShrink: 0,
                    }} />
                    {idx < currentAuditLog.length - 1 && (
                      <div style={{ width: 1, flex: 1, background: B.borderLight, marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: B.text, fontFamily: font }}>
                      {(entry.action || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </div>
                    <div style={{ fontSize: 11, color: B.textMuted, fontFamily: font, marginTop: 4 }}>
                      {formatRelativeTime(entry.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
