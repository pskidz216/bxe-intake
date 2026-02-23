import { B, inputStyle, labelStyle, selectStyle, textareaStyle, font } from '../theme';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  options = [],
  required = false,
  disabled = false,
  hint = '',
  error = '',
  rows = 3,
  prefix = '',
  suffix = '',
}) {
  const handleChange = (e) => {
    const val = type === 'number' ? (e.target.value === '' ? '' : e.target.value) : e.target.value;
    onChange(name, val);
  };

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          style={{ ...selectStyle, opacity: disabled ? 0.6 : 1 }}
        >
          <option value="">{placeholder || 'Select...'}</option>
          {options.map(opt => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const lab = typeof opt === 'string' ? opt : opt.label;
            return <option key={val} value={val}>{lab}</option>;
          })}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          style={{ ...textareaStyle, opacity: disabled ? 0.6 : 1 }}
        />
      );
    }

    // Text, number, email, tel, url, date
    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: 12, color: B.textMuted,
            fontSize: 14, fontFamily: font, pointerEvents: 'none',
          }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value ?? ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            ...inputStyle,
            paddingLeft: prefix ? 28 : 14,
            paddingRight: suffix ? 40 : 14,
            opacity: disabled ? 0.6 : 1,
          }}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: 12, color: B.textMuted,
            fontSize: 13, fontFamily: font, pointerEvents: 'none',
          }}>
            {suffix}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: B.red, marginLeft: 3 }}>*</span>}
        </label>
      )}
      {renderInput()}
      {hint && !error && (
        <div style={{ fontSize: 12, color: B.textMuted, marginTop: 4 }}>{hint}</div>
      )}
      {error && (
        <div style={{ fontSize: 12, color: B.red, marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}
