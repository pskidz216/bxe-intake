import { useState, useRef } from 'react';
import { B, font } from '../theme';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '../utils/constants';
import { formatFileSize } from '../utils/formatters';
import GlassCard from './GlassCard';

/**
 * SectionFileUpload — an inline file upload zone for any section.
 * In local (public) mode, files are stored in memory and later uploaded after auth.
 * Accepts PDFs, Excel, Word, PNG, JPEG.
 *
 * Props:
 *   sectionKey    — which section this upload belongs to
 *   title         — heading for the upload area
 *   description   — helper text
 *   hint          — what kinds of files to upload
 *   files         — array of locally-stored file objects [{ name, size, type, dataUrl }]
 *   onFilesChange — callback when files change
 *   disabled      — read-only mode
 */
export default function SectionFileUpload({ sectionKey, title, description, hint, files = [], onFilesChange, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    setError(null);

    // Validate type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
    ];
    if (!allowedTypes.includes(file.type)) {
      setError('File type not allowed. Accepted: PDF, Excel, Word, PNG, JPEG');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 50MB.');
      return;
    }

    // Store file reference locally
    const newFile = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file, // Keep the actual File object for later upload
      addedAt: new Date().toISOString(),
    };

    onFilesChange([...files, newFile]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    dropped.forEach(handleFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    selected.forEach(handleFile);
    e.target.value = '';
  };

  const removeFile = (fileId) => {
    if (disabled) return;
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '\uD83D\uDCC4';
    if (type.includes('spreadsheet') || type.includes('excel')) return '\uD83D\uDCCA';
    if (type.includes('word')) return '\uD83D\uDCDD';
    if (type.includes('image')) return '\uD83D\uDDBC\uFE0F';
    return '\uD83D\uDCC1';
  };

  return (
    <GlassCard style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 16 }}>&#128206;</span>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: B.text, fontFamily: font, margin: 0 }}>
          {title || 'Supporting Documents'}
        </h4>
      </div>
      <p style={{ fontSize: 12, color: B.textMuted, fontFamily: font, marginBottom: 12, marginTop: 2 }}>
        {description || 'Upload any files that support the information in this section.'}
      </p>

      {hint && (
        <div style={{
          fontSize: 12, color: B.blue, fontFamily: font,
          padding: '8px 12px', background: B.blueSoft, borderRadius: B.radiusSm,
          marginBottom: 12,
        }}>
          {hint}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {files.map(f => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', background: B.bgSolid, borderRadius: B.radiusSm,
              border: `1px solid ${B.green}30`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{getFileIcon(f.type)}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: B.text, fontFamily: font }}>
                    {f.name}
                  </div>
                  <div style={{ fontSize: 11, color: B.textMuted, fontFamily: font }}>
                    {formatFileSize(f.size)}
                  </div>
                </div>
              </div>
              {!disabled && (
                <button
                  onClick={() => removeFile(f.id)}
                  style={{
                    background: 'none', border: 'none', color: B.red,
                    fontSize: 12, cursor: 'pointer', fontFamily: font, fontWeight: 500,
                    padding: '4px 8px',
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {!disabled && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
          style={{
            border: `2px dashed ${dragOver ? B.orange : B.border}`,
            borderRadius: B.radiusSm,
            padding: '20px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? B.orangeSofter : B.white,
            transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            onChange={handleFileSelect}
            accept={ALLOWED_EXTENSIONS.join(',')}
            multiple
            style={{ display: 'none' }}
          />
          <div style={{ fontSize: 22, marginBottom: 4 }}>&#128194;</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: B.text, fontFamily: font }}>
            Drop files here or click to browse
          </div>
          <div style={{ fontSize: 11, color: B.textMuted, marginTop: 2, fontFamily: font }}>
            PDF, Excel, Word, PNG, JPEG — Max {formatFileSize(MAX_FILE_SIZE)}
          </div>
        </div>
      )}

      {error && (
        <div style={{ fontSize: 12, color: B.red, marginTop: 8, fontFamily: font }}>{error}</div>
      )}
    </GlassCard>
  );
}
