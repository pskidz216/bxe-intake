import { useEffect } from 'react';
import { useSection } from '../hooks/useSection';
import SectionHeader from '../components/SectionHeader';
import GlassCard from '../components/GlassCard';
import { B, font, inputStyle } from '../theme';
import { DEFAULT_KPIS } from '../utils/constants';

export default function KPIsSection({ applicationId, userId, disabled }) {
  const { data, status, saving, lastSaved, saveData } = useSection(applicationId, 'kpis', userId);

  // Initialize KPI rows if empty
  useEffect(() => {
    if (!data.kpis || data.kpis.length === 0) {
      const initial = DEFAULT_KPIS.map(name => ({
        name,
        current_value: '',
        target_12mo: '',
        target_24mo: '',
        notes: '',
      }));
      saveData({ kpis: initial });
    }
  }, [data.kpis, saveData]);

  const kpis = data.kpis || [];

  const updateKPI = (idx, field, value) => {
    if (disabled) return;
    const updated = [...kpis];
    updated[idx] = { ...updated[idx], [field]: value };
    saveData({ ...data, kpis: updated });
  };

  const cellStyle = {
    padding: '6px 8px',
    borderBottom: `1px solid ${B.borderLight}`,
    borderRight: `1px solid ${B.borderLight}`,
    fontSize: 12,
    fontFamily: font,
  };

  const cellInputStyle = {
    width: '100%',
    padding: '4px 6px',
    border: '1px solid transparent',
    borderRadius: 3,
    fontSize: 12,
    fontFamily: font,
    color: B.text,
    background: 'transparent',
    outline: 'none',
  };

  return (
    <div>
      <SectionHeader
        title="KPIs & Operations"
        description="Provide current values and targets for key operational metrics."
        status={status}
        saving={saving}
        lastSaved={lastSaved}
      />

      <GlassCard style={{ padding: 16 }}>
        <div style={{ overflowX: 'auto', borderRadius: B.radiusSm, border: `1px solid ${B.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: B.orangeSoft }}>
                <th style={{ ...cellStyle, textAlign: 'left', fontWeight: 700, width: 200 }}>KPI</th>
                <th style={{ ...cellStyle, textAlign: 'center', fontWeight: 600, width: 120 }}>Current</th>
                <th style={{ ...cellStyle, textAlign: 'center', fontWeight: 600, width: 120 }}>Target (12 mo)</th>
                <th style={{ ...cellStyle, textAlign: 'center', fontWeight: 600, width: 120 }}>Target (24 mo)</th>
                <th style={{ ...cellStyle, textAlign: 'left', fontWeight: 600 }}>Notes / Source</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((kpi, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? B.white : B.bgSolid }}>
                  <td style={{ ...cellStyle, fontWeight: 500, color: B.textSecondary }}>
                    {kpi.name}
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="text"
                      value={kpi.current_value}
                      onChange={e => updateKPI(i, 'current_value', e.target.value)}
                      disabled={disabled}
                      style={{ ...cellInputStyle, textAlign: 'center' }}
                      placeholder="—"
                      onFocus={e => { e.target.style.borderColor = B.orange; e.target.style.background = B.white; }}
                      onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent'; }}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="text"
                      value={kpi.target_12mo}
                      onChange={e => updateKPI(i, 'target_12mo', e.target.value)}
                      disabled={disabled}
                      style={{ ...cellInputStyle, textAlign: 'center' }}
                      placeholder="—"
                      onFocus={e => { e.target.style.borderColor = B.orange; e.target.style.background = B.white; }}
                      onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent'; }}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="text"
                      value={kpi.target_24mo}
                      onChange={e => updateKPI(i, 'target_24mo', e.target.value)}
                      disabled={disabled}
                      style={{ ...cellInputStyle, textAlign: 'center' }}
                      placeholder="—"
                      onFocus={e => { e.target.style.borderColor = B.orange; e.target.style.background = B.white; }}
                      onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent'; }}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="text"
                      value={kpi.notes}
                      onChange={e => updateKPI(i, 'notes', e.target.value)}
                      disabled={disabled}
                      style={cellInputStyle}
                      placeholder="Source or notes"
                      onFocus={e => { e.target.style.borderColor = B.orange; e.target.style.background = B.white; }}
                      onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent'; }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
