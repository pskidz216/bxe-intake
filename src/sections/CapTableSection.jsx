import { useMemo } from 'react';
import { useSection } from '../hooks/useSection';
import SectionHeader from '../components/SectionHeader';
import FormField from '../components/FormField';
import FormGrid from '../components/FormGrid';
import GlassCard from '../components/GlassCard';
import { B, font } from '../theme';
import { calcCapTable } from '../utils/financialCalcs';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export default function CapTableSection({ applicationId, userId, disabled }) {
  const { data, status, saving, lastSaved, saveField } = useSection(applicationId, 'cap_table', userId);

  const handleChange = (name, value) => {
    if (disabled) return;
    saveField(name, value);
  };

  const computed = useMemo(() => calcCapTable(data), [data]);

  const outputRow = (label, value) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: `1px solid ${B.borderLight}`,
    }}>
      <span style={{ fontSize: 13, color: B.textSecondary, fontFamily: font }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: B.orange, fontFamily: font }}>{value}</span>
    </div>
  );

  return (
    <div>
      <SectionHeader
        title="Cap Table"
        description="Enter your current capitalization details. Post-money metrics are computed automatically."
        status={status}
        saving={saving}
        lastSaved={lastSaved}
      />

      <GlassCard style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: B.text }}>Current Capitalization</h3>
        <FormGrid cols={2}>
          <FormField label="Common Shares Outstanding" name="common_shares" type="number" value={data.common_shares} onChange={handleChange} required disabled={disabled} placeholder="0" />
          <FormField label="Options Outstanding (ITM)" name="options_outstanding" type="number" value={data.options_outstanding} onChange={handleChange} disabled={disabled} placeholder="0" />
        </FormGrid>
        <FormGrid cols={2}>
          <FormField label="Option Pool Authorized" name="option_pool_authorized" type="number" value={data.option_pool_authorized} onChange={handleChange} disabled={disabled} placeholder="0" />
          <FormField label="Warrants" name="warrants" type="number" value={data.warrants} onChange={handleChange} disabled={disabled} placeholder="0" />
        </FormGrid>
        <FormGrid cols={2}>
          <FormField label="SAFE / Note Conversion Shares" name="safe_note_conversion_shares" type="number" value={data.safe_note_conversion_shares} onChange={handleChange} disabled={disabled} placeholder="0" />
          <div /> {/* spacer */}
        </FormGrid>
      </GlassCard>

      <GlassCard style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: B.text }}>Valuation & Investment</h3>
        <FormGrid cols={2}>
          <FormField label="Pre-Money Valuation" name="pre_money_valuation" type="number" value={data.pre_money_valuation} onChange={handleChange} required disabled={disabled} prefix="$" placeholder="0" />
          <FormField label="Investment Amount" name="investment_amount" type="number" value={data.investment_amount} onChange={handleChange} disabled={disabled} prefix="$" placeholder="0" />
        </FormGrid>
      </GlassCard>

      <GlassCard>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: B.orange }}>Computed Outputs</h3>
        {outputRow('Fully Diluted Shares', formatNumber(computed.fullyDiluted))}
        {outputRow('Price Per Share', formatCurrency(computed.pricePerShare))}
        {outputRow('New Shares Issued', formatNumber(computed.newShares))}
        {outputRow('Post-Money Valuation', formatCurrency(computed.postMoney))}
        {outputRow('Investor Ownership %', formatPercent(computed.investorOwnership))}
      </GlassCard>
    </div>
  );
}
