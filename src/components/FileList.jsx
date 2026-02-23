import { B, font } from '../theme';
import { formatFileSize, formatRelativeTime } from '../utils/formatters';

export default function FileList({ documents, onDownload, onDelete }) {
  if (!documents || documents.length === 0) return null;

  const getTypeIcon = (type) => {
    if (type?.includes('pdf')) return 'PDF';
    if (type?.includes('spreadsheet') || type?.includes('excel')) return 'XLS';
    if (type?.includes('word')) return 'DOC';
    if (type?.includes('image')) return 'IMG';
    return 'FILE';
  };

  const getTypeColor = (type) => {
    if (type?.includes('pdf')) return B.red;
    if (type?.includes('spreadsheet') || type?.includes('excel')) return B.green;
    if (type?.includes('word')) return B.blue;
    if (type?.includes('image')) return B.orange;
    return B.textMuted;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {documents.map(doc => (
        <div
          key={doc.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            background: B.white,
            borderRadius: B.radiusSm,
            border: `1px solid ${B.borderLight}`,
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: `${getTypeColor(doc.file_type)}12`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 800, color: getTypeColor(doc.file_type),
            fontFamily: font,
          }}>
            {getTypeIcon(doc.file_type)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 500, color: B.text, fontFamily: font,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {doc.file_name}
            </div>
            <div style={{ fontSize: 11, color: B.textMuted, fontFamily: font }}>
              {formatFileSize(doc.file_size)} · {formatRelativeTime(doc.uploaded_at)}
            </div>
          </div>
          <button
            onClick={() => onDownload(doc)}
            style={{
              padding: '4px 10px', fontSize: 11, fontWeight: 600,
              color: B.blue, background: B.blueSoft, border: 'none',
              borderRadius: 4, cursor: 'pointer', fontFamily: font,
            }}
          >
            Download
          </button>
          <button
            onClick={() => onDelete(doc.id)}
            style={{
              padding: '4px 10px', fontSize: 11, fontWeight: 600,
              color: B.red, background: B.redSoft, border: 'none',
              borderRadius: 4, cursor: 'pointer', fontFamily: font,
            }}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
