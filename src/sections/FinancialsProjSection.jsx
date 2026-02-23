import { useMemo } from 'react';
import { useSection } from '../hooks/useSection';
import SectionHeader from '../components/SectionHeader';
import FormField from '../components/FormField';
import FormGrid from '../components/FormGrid';
import GlassCard from '../components/GlassCard';
import { B, font } from '../theme';
import { calcProjections } from '../utils/financialCalcs';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function FinancialsProjSection({ applicationId, userId, disabled }) {
  const { data, status, saving, lastSaved, saveField } = useSection(applicationId, 'financials_proj', userId);

  const handleChange = (name, value) => {
    if (disabled) return;
    saveField(name, value);
  };

  const projections = useMemo(() => {
    return calcProjections(data.base_revenue || 0, {
      revenue_cagr: data.revenue_cagr,
      gross_margin_target: data.gross_margin_target,
      opex_pct_revenue: data.opex_pct_revenue,
      da_pct: data.da_pct,
      capex_pct: data.capex_pct,
      nwc_change_pct: data.nwc_change_pct,
      tax_rate: data.tax_rate,
    });
  }, [data]);

  const cellStyle = {
    padding: '8px 10px',
    borderBottom: `1px solid ${B.borderLight}`,
    fontSize: 12,
    fontFamily: font,
    textAlign: 'right',
  };

  return (
    <div>
      <SectionHeader
        title="Projected Financials"
        description="Define your growth assumptions and the system will compute 5-year projections."
        status={status}
        saving={saving}
        lastSaved={lastSaved}
      />

      <GlassCard style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: B.text }}>Driver Assumptions</h3>
        <FormGrid cols={2}>
          <FormField label="Base Revenue (Year 0 / TTM)" name="base_revenue" type="number" value={data.base_revenue} onChange={handleChange} required disabled={disabled} prefix="$" placeholder="0" />
          <FormField label="Revenue CAGR" name="revenue_cagr" type="number" value={data.revenue_cagr} onChange={handleChange} required disabled={disabled} suffix="%" placeholder="25" />
        </FormGrid>
        <FormGrid cols={3}>
          <FormField label="Gross Margin Target" name="gross_margin_target" type="number" value={data.gross_margin_target} onChange={handleChange} required disabled={disabled} suffix="%" placeholder="55" />
          <FormField label="OpEx as % of Revenue" name="opex_pct_revenue" type="number" value={data.opex_pct_revenue} onChange={handleChange} disabled={disabled} suffix="%" placeholder="35" />
          <FormField label="Tax Rate" name="tax_rate" type="number" value={data.tax_rate} onChange={handleChange} disabled={disabled} suffix="%" placeholder="25" />
        </FormGrid>
        <FormGrid cols={3}>
          <FormField label="D&A as % of Revenue" name="da_pct" type="number" value={data.da_pct} onChange={handleChange} disabled={disabled} suffix="%" placeholder="3" />
          <FormField label="CapEx as % of Revenue" name="capex_pct" type="number" value={data.capex_pct} onChange={handleChange} disabled={disabled} suffix="%" placeholder="5" />
          <FormField label="NWC Change as % of Revenue" name="nwc_change_pct" type="number" value={data.nwc_change_pct} onChange={handleChange} disabled={disabled} suffix="%" placeholder="2" />
        </FormGrid>
      </GlassCard>

      <GlassCard>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: B.text }}>5-Year Projection</h3>
        <div style={{ overflowX: 'auto', borderRadius: B.radiusSm, border: `1px solid ${B.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: B.orangeSoft }}>
                <th style={{ ...cellStyle, textAlign: 'left', fontWeight: 700 }}>Metric</th>
                {projections.map(p => (
                  <th key={p.year} style={{ ...cellStyle, fontWeight: 600 }}>Year {p.year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'revenue', label: 'Revenue' },
                { key: 'cogs', label: 'COGS' },
                { key: 'grossProfit', label: 'Gross Profit', highlight: true },
                { key: 'opex', label: 'OpEx' },
                { key: 'ebitda', label: 'EBITDA', highlight: true },
                { key: 'fcf', label: 'Free Cash Flow', highlight: true },
              ].map((row, i) => (
                <tr key={row.key} style={{ background: i % 2 === 0 ? B.white : B.bgSolid }}>
                  <td style={{ ...cellStyle, textAlign: 'left', fontWeight: row.highlight ? 600 : 400, color: row.highlight ? B.orange : B.text }}>
                    {row.label}
                  </td>
                  {projections.map(p => (
                    <td key={p.year} style={{ ...cellStyle, color: row.highlight ? B.orange : B.text, fontWeight: row.highlight ? 600 : 400 }}>
                      {formatCurrency(p[row.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
