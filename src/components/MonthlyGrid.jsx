import { useMemo } from 'react';
import { B, font } from '../theme';
import { calcGrossProfit, calcEBITDA, calcTTM } from '../utils/financialCalcs';
import { formatCurrency } from '../utils/formatters';

const COLUMNS = [
  { key: 'revenue', label: 'Revenue', editable: true },
  { key: 'cogs', label: 'COGS', editable: true },
  { key: 'gross_profit', label: 'Gross Profit', editable: false },
  { key: 'opex', label: 'OpEx', editable: true },
  { key: 'ebitda', label: 'EBITDA', editable: false },
  { key: 'net_debt', label: 'Net Debt', editable: true },
  { key: 'notes', label: 'Notes', editable: true, type: 'text' },
];

function generateMonths(count = 24) {
  const months = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    });
  }
  return months;
}

const cellStyle = {
  padding: '6px 8px',
  borderBottom: `1px solid ${B.borderLight}`,
  borderRight: `1px solid ${B.borderLight}`,
  fontSize: 12,
  fontFamily: font,
};

const inputCellStyle = {
  width: '100%',
  padding: '4px 6px',
  border: `1px solid transparent`,
  borderRadius: 3,
  fontSize: 12,
  fontFamily: font,
  color: B.text,
  background: 'transparent',
  textAlign: 'right',
  outline: 'none',
};

export default function MonthlyGrid({ data, onUpdate }) {
  const months = useMemo(() => generateMonths(24), []);
  const monthlyData = data.monthly_data || months.map(m => ({
    month: m.key, revenue: '', cogs: '', opex: '', net_debt: '', notes: '',
  }));

  const handleCellChange = (monthIdx, field, value) => {
    const updated = [...monthlyData];
    updated[monthIdx] = { ...updated[monthIdx], [field]: value };
    // Compute derived fields
    updated[monthIdx].gross_profit = calcGrossProfit(updated[monthIdx].revenue, updated[monthIdx].cogs);
    updated[monthIdx].ebitda = calcEBITDA(updated[monthIdx].gross_profit, updated[monthIdx].opex);
    onUpdate({ ...data, monthly_data: updated });
  };

  const ttm = useMemo(() => calcTTM(monthlyData), [monthlyData]);

  return (
    <div style={{ overflowX: 'auto', borderRadius: B.radiusSm, border: `1px solid ${B.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
        <thead>
          <tr style={{ background: B.orangeSoft }}>
            <th style={{ ...cellStyle, textAlign: 'left', fontWeight: 700, color: B.text, width: 100, position: 'sticky', left: 0, background: B.orangeSoft, zIndex: 1 }}>
              Month
            </th>
            {COLUMNS.map(col => (
              <th key={col.key} style={{
                ...cellStyle,
                textAlign: col.type === 'text' ? 'left' : 'right',
                fontWeight: 600,
                color: col.editable ? B.text : B.orange,
                fontSize: 11,
                minWidth: col.type === 'text' ? 120 : 90,
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((month, idx) => {
            const row = monthlyData[idx] || {};
            return (
              <tr key={month.key} style={{ background: idx % 2 === 0 ? B.white : B.bgSolid }}>
                <td style={{ ...cellStyle, fontWeight: 500, color: B.textSecondary, position: 'sticky', left: 0, background: idx % 2 === 0 ? B.white : B.bgSolid, zIndex: 1 }}>
                  {month.label}
                </td>
                {COLUMNS.map(col => (
                  <td key={col.key} style={{
                    ...cellStyle,
                    textAlign: col.type === 'text' ? 'left' : 'right',
                    background: !col.editable ? B.orangeSofter : 'transparent',
                  }}>
                    {col.editable ? (
                      <input
                        type={col.type === 'text' ? 'text' : 'number'}
                        value={row[col.key] ?? ''}
                        onChange={e => handleCellChange(idx, col.key, e.target.value)}
                        style={{
                          ...inputCellStyle,
                          textAlign: col.type === 'text' ? 'left' : 'right',
                        }}
                        onFocus={e => { e.target.style.borderColor = B.orange; e.target.style.background = B.white; }}
                        onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent'; }}
                      />
                    ) : (
                      <span style={{ color: B.orange, fontWeight: 500 }}>
                        {row[col.key] ? formatCurrency(row[col.key]) : '—'}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
          {/* TTM Summary Row */}
          <tr style={{ background: B.orangeSoft, fontWeight: 700 }}>
            <td style={{ ...cellStyle, fontWeight: 700, color: B.text, position: 'sticky', left: 0, background: B.orangeSoft, zIndex: 1 }}>
              TTM
            </td>
            <td style={{ ...cellStyle, textAlign: 'right', color: B.text }}>{ttm ? formatCurrency(ttm.revenue) : '—'}</td>
            <td style={{ ...cellStyle, textAlign: 'right', color: B.text }}>{ttm ? formatCurrency(ttm.cogs) : '—'}</td>
            <td style={{ ...cellStyle, textAlign: 'right', color: B.orange }}>{ttm ? formatCurrency(ttm.grossProfit) : '—'}</td>
            <td style={{ ...cellStyle, textAlign: 'right', color: B.text }}>{ttm ? formatCurrency(ttm.opex) : '—'}</td>
            <td style={{ ...cellStyle, textAlign: 'right', color: B.orange }}>{ttm ? formatCurrency(ttm.ebitda) : '—'}</td>
            <td style={{ ...cellStyle, textAlign: 'right', color: B.textMuted }}>—</td>
            <td style={{ ...cellStyle, color: B.textMuted }}>—</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
