import { useEffect } from 'react';
import { useSection } from '../hooks/useSection';
import { useFileUpload } from '../hooks/useFileUpload';
import SectionHeader from '../components/SectionHeader';
import GlassCard from '../components/GlassCard';
import FileUploader from '../components/FileUploader';
import FileList from '../components/FileList';
import { B, font } from '../theme';
import { DOCUMENT_CHECKLIST } from '../utils/constants';

export default function DocumentsSection({ applicationId, userId, disabled }) {
  const { data, status, saving, lastSaved } = useSection(applicationId, 'documents', userId);
  const { documents, uploading, uploadError, loadDocuments, uploadFile, getSignedUrl, deleteDocument, setUploadError } = useFileUpload(applicationId, userId);

  const isLocalMode = !applicationId;

  useEffect(() => {
    if (!isLocalMode) loadDocuments();
  }, [loadDocuments, isLocalMode]);

  const handleUpload = async (file, checklistItem) => {
    setUploadError(null);
    await uploadFile(file, 'documents', checklistItem);
  };

  const handleDownload = async (doc) => {
    const url = await getSignedUrl(doc.storage_path);
    if (url) window.open(url, '_blank');
  };

  const getDocsForItem = (itemKey) => {
    return documents.filter(d => d.checklist_item === itemKey);
  };

  const generalDocs = documents.filter(d => !d.checklist_item || d.checklist_item === 'other');

  // In local (public) mode, show the checklist but explain uploads happen after account creation
  if (isLocalMode) {
    return (
      <div>
        <SectionHeader
          title="Documents & Uploads"
          description="Review the document checklist below. You'll be able to upload files after creating your account."
          status={status}
          saving={saving}
          lastSaved={lastSaved}
        />

        {/* Upload notice */}
        <div style={{
          padding: '14px 18px',
          background: B.blueSoft,
          borderRadius: B.radiusSm,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>&#128274;</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: B.blue, fontFamily: font }}>
              File uploads available after account creation
            </div>
            <div style={{ fontSize: 12, color: B.textSecondary, fontFamily: font, marginTop: 2 }}>
              Submit your application first, then upload documents from your dashboard.
              Review the checklist below so you know what to prepare.
            </div>
          </div>
        </div>

        {/* Required Documents Checklist */}
        <GlassCard style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: B.text }}>Required Documents</h3>
          <p style={{ fontSize: 12, color: B.textMuted, marginBottom: 16, fontFamily: font }}>
            These documents are required for your application to be reviewed.
          </p>
          {DOCUMENT_CHECKLIST.filter(item => item.required).map(item => (
            <div key={item.key} style={{
              padding: '12px 14px',
              background: B.bgSolid,
              borderRadius: B.radiusSm,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: 14, color: B.textMuted }}>&#9675;</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: B.text, fontFamily: font, flex: 1 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: B.red, fontFamily: font }}>REQUIRED</span>
            </div>
          ))}
        </GlassCard>

        {/* Optional Documents Checklist */}
        <GlassCard>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: B.text }}>Optional Documents</h3>
          <p style={{ fontSize: 12, color: B.textMuted, marginBottom: 16, fontFamily: font }}>
            Providing additional documents strengthens your application.
          </p>
          {DOCUMENT_CHECKLIST.filter(item => !item.required).map(item => (
            <div key={item.key} style={{
              padding: '12px 14px',
              background: B.bgSolid,
              borderRadius: B.radiusSm,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: 14, color: B.textMuted }}>&#9675;</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: B.text, fontFamily: font }}>
                {item.label}
              </span>
            </div>
          ))}
        </GlassCard>
      </div>
    );
  }

  // Authenticated mode — full upload functionality
  return (
    <div>
      <SectionHeader
        title="Documents & Uploads"
        description="Upload required and optional documents for due diligence. You can also upload branding, pitch decks, and any other relevant materials."
        status={status}
        saving={saving}
        lastSaved={lastSaved}
      />

      {/* Required Documents */}
      <GlassCard style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: B.text }}>Required Documents</h3>
        <p style={{ fontSize: 12, color: B.textMuted, marginBottom: 16, fontFamily: font }}>
          These documents are required for your application to be reviewed.
        </p>
        {DOCUMENT_CHECKLIST.filter(item => item.required).map(item => {
          const itemDocs = getDocsForItem(item.key);
          return (
            <div key={item.key} style={{
              padding: '14px',
              background: B.bgSolid,
              borderRadius: B.radiusSm,
              marginBottom: 8,
              border: `1px solid ${itemDocs.length > 0 ? `${B.green}30` : B.borderLight}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: itemDocs.length > 0 ? 10 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 14,
                    color: itemDocs.length > 0 ? B.green : B.textMuted,
                  }}>
                    {itemDocs.length > 0 ? '\u2713' : '\u25CB'}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: B.text, fontFamily: font }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: B.red, fontFamily: font }}>REQUIRED</span>
                </div>
              </div>
              {itemDocs.length > 0 && (
                <FileList documents={itemDocs} onDownload={handleDownload} onDelete={disabled ? () => {} : deleteDocument} />
              )}
              {!disabled && (
                <div style={{ marginTop: 8 }}>
                  <FileUploader
                    onUpload={(file) => handleUpload(file, item.key)}
                    uploading={uploading}
                    error={uploadError}
                  />
                </div>
              )}
            </div>
          );
        })}
      </GlassCard>

      {/* Optional Documents */}
      <GlassCard style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: B.text }}>Optional Documents</h3>
        <p style={{ fontSize: 12, color: B.textMuted, marginBottom: 16, fontFamily: font }}>
          Providing additional documents strengthens your application.
        </p>
        {DOCUMENT_CHECKLIST.filter(item => !item.required).map(item => {
          const itemDocs = getDocsForItem(item.key);
          return (
            <div key={item.key} style={{
              padding: '14px',
              background: B.bgSolid,
              borderRadius: B.radiusSm,
              marginBottom: 8,
              border: `1px solid ${itemDocs.length > 0 ? `${B.green}30` : B.borderLight}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: itemDocs.length > 0 ? 10 : 0 }}>
                <span style={{ fontSize: 14, color: itemDocs.length > 0 ? B.green : B.textMuted }}>
                  {itemDocs.length > 0 ? '\u2713' : '\u25CB'}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: B.text, fontFamily: font }}>
                  {item.label}
                </span>
              </div>
              {itemDocs.length > 0 && (
                <FileList documents={itemDocs} onDownload={handleDownload} onDelete={disabled ? () => {} : deleteDocument} />
              )}
              {!disabled && (
                <div style={{ marginTop: 8 }}>
                  <FileUploader
                    onUpload={(file) => handleUpload(file, item.key)}
                    uploading={uploading}
                    error={null}
                  />
                </div>
              )}
            </div>
          );
        })}
      </GlassCard>

      {/* General uploads */}
      <GlassCard>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: B.text }}>Additional Materials</h3>
        <p style={{ fontSize: 12, color: B.textMuted, marginBottom: 16, fontFamily: font }}>
          Upload any other relevant materials — branding assets, pitch decks, market research, etc.
        </p>
        {generalDocs.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <FileList documents={generalDocs} onDownload={handleDownload} onDelete={disabled ? () => {} : deleteDocument} />
          </div>
        )}
        {!disabled && (
          <FileUploader
            onUpload={(file) => handleUpload(file, 'other')}
            uploading={uploading}
            error={uploadError}
          />
        )}
      </GlassCard>
    </div>
  );
}
