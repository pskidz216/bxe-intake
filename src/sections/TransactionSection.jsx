import { useSection } from '../hooks/useSection';
import SectionHeader from '../components/SectionHeader';
import FormField from '../components/FormField';
import FormGrid from '../components/FormGrid';
import GlassCard from '../components/GlassCard';
import { B, font } from '../theme';
import {
  TRANSACTION_PATHS, EXIT_TYPES, CLOSE_WINDOWS,
  SECURITY_TYPES, FOUNDER_INTENTS,
} from '../utils/constants';

export default function TransactionSection({ applicationId, userId, disabled }) {
  const { data, status, saving, lastSaved, saveField } = useSection(applicationId, 'transaction', userId);

  const handleChange = (name, value) => {
    if (disabled) return;
    saveField(name, value);
  };

  return (
    <div>
      <SectionHeader
        title="Transaction"
        description="Select your engagement path and define the structure of the deal."
        status={status}
        saving={saving}
        lastSaved={lastSaved}
      />

      <GlassCard style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: B.text }}>Transaction Path</h3>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {TRANSACTION_PATHS.map(tp => (
            <button
              key={tp.value}
              onClick={() => handleChange('path', tp.value)}
              disabled={disabled}
              style={{
                flex: 1,
                padding: '16px 12px',
                border: `2px solid ${data.path === tp.value ? B.orange : B.border}`,
                borderRadius: B.radius,
                background: data.path === tp.value ? B.orangeSoft : B.white,
                cursor: disabled ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: data.path === tp.value ? B.orange : B.text, fontFamily: font }}>
                {tp.label}
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      {data.path && (
        <>
          <GlassCard style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: B.text }}>Deal Structure</h3>
            <FormGrid cols={2}>
              {data.path !== 'ma' && (
                <FormField label="Investment Amount" name="investment_amount" type="number" value={data.investment_amount} onChange={handleChange} required disabled={disabled} prefix="$" placeholder="0" />
              )}
              <FormField label="Pre-Money Valuation" name="pre_money_valuation" type="number" value={data.pre_money_valuation} onChange={handleChange} disabled={disabled} prefix="$" placeholder="0" />
            </FormGrid>
            <FormGrid cols={2}>
              <FormField label="Security Type" name="security_type" type="select" value={data.security_type} onChange={handleChange} required={data.path !== 'ma'} disabled={disabled} options={SECURITY_TYPES} />
              <FormField label="Target Ownership %" name="ownership_pct" type="number" value={data.ownership_pct} onChange={handleChange} disabled={disabled} suffix="%" placeholder="0" />
            </FormGrid>
            <FormGrid cols={2}>
              <FormField label="Close Window" name="close_window" type="select" value={data.close_window} onChange={handleChange} disabled={disabled} options={CLOSE_WINDOWS} />
              {data.path !== 'equity_investment' && (
                <FormField label="Exit Type" name="exit_type" type="select" value={data.exit_type} onChange={handleChange} disabled={disabled} options={EXIT_TYPES} />
              )}
            </FormGrid>
          </GlassCard>

          <GlassCard>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: B.text }}>Additional Details</h3>
            <FormField label="Use of Proceeds Summary" name="use_of_proceeds_summary" type="textarea" value={data.use_of_proceeds_summary} onChange={handleChange} disabled={disabled} placeholder="Briefly describe how funds will be used" />
            <FormField label="Governance Expectations" name="governance_expectations" type="textarea" value={data.governance_expectations} onChange={handleChange} disabled={disabled} placeholder="Board seats, reporting requirements, veto rights..." />
            <FormField label="Tranche / Milestone Structure" name="tranche_structure" type="textarea" value={data.tranche_structure} onChange={handleChange} disabled={disabled} placeholder="Describe any milestone-based funding tranches" />
            <FormField label="Founder Intent" name="founder_intent" type="select" value={data.founder_intent} onChange={handleChange} disabled={disabled} options={FOUNDER_INTENTS} />
          </GlassCard>
        </>
      )}
    </div>
  );
}
