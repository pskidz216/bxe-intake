import { useSection } from '../hooks/useSection';
import SectionHeader from '../components/SectionHeader';
import GlassCard from '../components/GlassCard';
import MonthlyGrid from '../components/MonthlyGrid';
import { B, font } from '../theme';

export default function FinancialsHistSection({ applicationId, userId, disabled }) {
  const { data, status, saving, lastSaved, saveData } = useSection(applicationId, 'financials_hist', userId);

  const handleUpdate = (newData) => {
    if (disabled) return;
    saveData(newData);
  };

  return (
    <div>
      <SectionHeader
        title="Historical Financials"
        description="Enter up to 24 months of historical financial data. Gross Profit and EBITDA are auto-calculated."
        status={status}
        saving={saving}
        lastSaved={lastSaved}
      />

      <GlassCard style={{ marginBottom: 20, padding: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          padding: '8px 12px', background: B.blueSoft, borderRadius: B.radiusSm,
        }}>
          <span style={{ fontSize: 13, color: B.blue, fontFamily: font }}>
            Blue input cells are editable. Orange cells are computed automatically.
          </span>
        </div>
        <MonthlyGrid data={data} onUpdate={handleUpdate} />
      </GlassCard>
    </div>
  );
}
