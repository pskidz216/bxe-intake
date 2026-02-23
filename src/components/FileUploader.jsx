import { useState, useRef } from 'react';
import { B, font } from '../theme';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '../utils/constants';
import { formatFileSize } from '../utils/formatters';

export default function FileUploader({ onUpload, uploading, error }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onUpload(files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleClick = () => inputRef.current?.click();

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${dragOver ? B.orange : B.border}`,
          borderRadius: B.radius,
          padding: '32px 24px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: dragOver ? B.orangeSofter : B.white,
          transition: 'border-color 0.2s, background 0.2s',
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileSelect}
          accept={ALLOWED_EXTENSIONS.join(',')}
          style={{ display: 'none' }}
        />
        <div style={{ fontSize: 28, marginBottom: 8 }}>
          {uploading ? '\u23F3' : '\u2B06\uFE0F'}
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: B.text, fontFamily: font }}>
          {uploading ? 'Uploading...' : 'Drop file here or click to browse'}
        </div>
        <div style={{ fontSize: 12, color: B.textMuted, marginTop: 4, fontFamily: font }}>
          PDF, XLSX, DOCX, PNG, JPEG — Max {formatFileSize(MAX_FILE_SIZE)}
        </div>
      </div>
      {error && (
        <div style={{ fontSize: 12, color: B.red, marginTop: 8, fontFamily: font }}>{error}</div>
      )}
    </div>
  );
}
