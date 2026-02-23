import { useMemo } from 'react';
import { useSection } from '../hooks/useSection';
import SectionHeader from '../components/SectionHeader';
import FormField from '../components/FormField';
import FormGrid from '../components/FormGrid';
import GlassCard from '../components/GlassCard';
import { B, font, buttonSecondary } from '../theme';
import { calcBlendedValuation } from '../utils/financialCalcs';
import { formatCurrency } from '../utils/formatters';

export default function ValuationSection({ applicationId, userId, disabled }) {
  const { data, status, saving, lastSaved, saveField, saveData } = useSection(applicationId, 'valuation', userId);

  const handleChange = (name, value) => {
    if (disabled) return;
    saveField(name, value);
  };

  // Dynamic comps rows
  const comps = data.market_comps || [];
  const addComp = () => {
    if (disabled) return;
    saveData({ ...data, market_comps: [...comps, { company_name: '', ev_revenue: '', ev_ebitda: '', source: '' }] });
  };
  const updateComp = (idx, field, value) => {
    if (disabled) return;
    const updated = [...comps];
    updated[idx] = { ...updated[idx], [field]: value };
    saveData({ ...data, market_comps: updated });
  };
  const removeComp = (idx) => {
    if (disabled) return;
    saveData({ ...data, market_comps: comps.filter((_, i) => i !== idx) });
  };

  // Dynamic precedent rows
  const precs = data.precedent_transactions || [];
  const addPrec = () => {
    if (disabled) return;
    saveData({ ...data, precedent_transactions: [...precs, { target_name: '', acquirer_name: '', ev_revenue: '', ev_ebitda: '', date: '', source: '' }] });
  };
  const updatePrec = (idx, field, value) => {
    if (disabled) return;
    const updated = [...precs];
    updated[idx] = { ...updated[idx], [field]: value };
    saveData({ ...data, precedent_transactions: updated });
  };
  const removePrec = (idx) => {
    if (disabled) return;
    saveData({ ...data, precedent_transactions: precs.filter((_, i) => i !== idx) });
  };

  const blended = useMemo(() => {
    return calcBlendedValuation(
      data.dcf_enterprise_value || 0,
      data.comps_value || 0,
      data.precedent_value || 0,
      { dcf: data.dcf_weight, comps: data.comps_weight, precedent: data.precedent_weight }
    );
  }, [data]);

  const cellStyle = { padding: '6px 8px', fontSize: 12, fontFamily: font };

  return (
    <div>
      <SectionHeader
        title="Valuation"
        description="Provide DCF inputs, market comps, and precedent transactions. All three methods are required."
        status={status}
        saving={saving}
        lastSaved={lastSaved}
      />

      <GlassCard style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: B.text }}>DCF Inputs</h3>
        <FormGrid cols={2}>
          <FormField label="WACC / Discount Rate" name="wacc" type="number" value={data.wacc} onChange={handleChange} required disabled={disabled} suffix="%" placeholder="18" />
          <FormField label="Terminal Growth Rate" name="terminal_growth_rate" type="number" value={data.terminal_growth_rate} onChange={handleChange} required disabled={disabled} suffix="%" placeholder="3" />
        </FormGrid>
        <FormField label="DCF Enterprise Value (your estimate)" name="dcf_enterprise_value" type="number" value={data.dcf_enterprise_value} onChange={handleChange} disabled={disabled} prefix="$" placeholder="0" />
      </GlassCard>

      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: B.text, margin: 0 }}>Market Comparables</h3>
          <button onClick={addComp} disabled={disabled || comps.length >= 5} style={{ ...buttonSecondary, padding: '4px 12px', fontSize: 12 }}>
            + Add Comp
          </button>
        </div>
        {comps.map((comp, i) => (
          <div key={i} style={{ padding: '12px', background: B.bgSolid, borderRadius: B.radiusSm, marginBottom: 8 }}>
            <FormGrid cols={3}>
              <FormField label="Company" name="company_name" value={comp.company_name} onChange={(_, v) => updateComp(i, 'company_name', v)} disabled={disabled} placeholder="Company name" />
              <FormField label="EV/Revenue" name="ev_revenue" type="number" value={comp.ev_revenue} onChange={(_, v) => updateComp(i, 'ev_revenue', v)} disabled={disabled} suffix="x" />
              <FormField label="EV/EBITDA" name="ev_ebitda" type="number" value={comp.ev_ebitda} onChange={(_, v) => updateComp(i, 'ev_ebitda', v)} disabled={disabled} suffix="x" />
            </FormGrid>
            <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
              <div style={{ flex: 1 }}>
                <FormField label="Source" name="source" value={comp.source} onChange={(_, v) => updateComp(i, 'source', v)} disabled={disabled} placeholder="Data source" />
              </div>
              <button onClick={() => removeComp(i)} disabled={disabled} style={{ ...buttonSecondary, padding: '6px 10px', fontSize: 11, color: B.red, marginBottom: 16 }}>Remove</button>
            </div>
          </div>
        ))}
        <FormField label="Comps-Based Value (your estimate)" name="comps_value" type="number" value={data.comps_value} onChange={handleChange} disabled={disabled} prefix="$" placeholder="0" />
      </GlassCard>

      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: B.text, margin: 0 }}>Precedent Transactions</h3>
          <button onClick={addPrec} disabled={disabled || precs.length >= 5} style={{ ...buttonSecondary, padding: '4px 12px', fontSize: 12 }}>
            + Add Transaction
          </button>
        </div>
        {precs.map((prec, i) => (
          <div key={i} style={{ padding: '12px', background: B.bgSolid, borderRadius: B.radiusSm, marginBottom: 8 }}>
            <FormGrid cols={2}>
              <FormField label="Target" name="target_name" value={prec.target_name} onChange={(_, v) => updatePrec(i, 'target_name', v)} disabled={disabled} />
              <FormField label="Acquirer" name="acquirer_name" value={prec.acquirer_name} onChange={(_, v) => updatePrec(i, 'acquirer_name', v)} disabled={disabled} />
            </FormGrid>
            <FormGrid cols={3}>
              <FormField label="EV/Revenue" name="ev_revenue" type="number" value={prec.ev_revenue} onChange={(_, v) => updatePrec(i, 'ev_revenue', v)} disabled={disabled} suffix="x" />
              <FormField label="EV/EBITDA" name="ev_ebitda" type="number" value={prec.ev_ebitda} onChange={(_, v) => updatePrec(i, 'ev_ebitda', v)} disabled={disabled} suffix="x" />
              <FormField label="Date" name="date" type="text" value={prec.date} onChange={(_, v) => updatePrec(i, 'date', v)} disabled={disabled} placeholder="YYYY" />
            </FormGrid>
            <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
              <div style={{ flex: 1 }}>
                <FormField label="Source" name="source" value={prec.source} onChange={(_, v) => updatePrec(i, 'source', v)} disabled={disabled} />
              </div>
              <button onClick={() => removePrec(i)} disabled={disabled} style={{ ...buttonSecondary, padding: '6px 10px', fontSize: 11, color: B.red, marginBottom: 16 }}>Remove</button>
            </div>
          </div>
        ))}
        <FormField label="Precedent-Based Value (your estimate)" name="precedent_value" type="number" value={data.precedent_value} onChange={handleChange} disabled={disabled} prefix="$" placeholder="0" />
      </GlassCard>

      <GlassCard>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: B.text }}>Weighting & Reconciliation</h3>
        <FormGrid cols={3}>
          <FormField label="DCF Weight" name="dcf_weight" type="number" value={data.dcf_weight} onChange={handleChange} disabled={disabled} suffix="%" placeholder="50" />
          <FormField label="Comps Weight" name="comps_weight" type="number" value={data.comps_weight} onChange={handleChange} disabled={disabled} suffix="%" placeholder="30" />
          <FormField label="Precedent Weight" name="precedent_weight" type="number" value={data.precedent_weight} onChange={handleChange} disabled={disabled} suffix="%" placeholder="20" />
        </FormGrid>
        {(() => {
          const sum = (parseFloat(data.dcf_weight) || 0) + (parseFloat(data.comps_weight) || 0) + (parseFloat(data.precedent_weight) || 0);
          if (sum > 0 && Math.abs(sum - 100) > 0.01) {
            return <div style={{ fontSize: 12, color: B.red, marginBottom: 8, fontFamily: font }}>Weights must sum to 100% (currently {sum}%)</div>;
          }
          return null;
        })()}
        <div style={{
          padding: '16px', background: B.orangeSoft, borderRadius: B.radius,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: B.text, fontFamily: font }}>Blended Valuation</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: B.orange, fontFamily: font }}>{formatCurrency(blended)}</span>
        </div>
      </GlassCard>
    </div>
  );
}
