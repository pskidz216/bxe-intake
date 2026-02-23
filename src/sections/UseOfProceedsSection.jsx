import { useSection } from '../hooks/useSection';
import SectionHeader from '../components/SectionHeader';
import FormField from '../components/FormField';
import FormGrid from '../components/FormGrid';
import GlassCard from '../components/GlassCard';
import { B, font, buttonSecondary } from '../theme';
import { UOP_CATEGORIES, UOP_TIMINGS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

export default function UseOfProceedsSection({ applicationId, userId, disabled }) {
  const { data, status, saving, lastSaved, saveData } = useSection(applicationId, 'use_of_proceeds', userId);

  const categories = data.categories || [];

  const addCategory = () => {
    if (disabled) return;
    saveData({ ...data, categories: [...categories, { category: '', amount: '', timing: '', milestone: '' }] });
  };

  const updateCategory = (idx, field, value) => {
    if (disabled) return;
    const updated = [...categories];
    updated[idx] = { ...updated[idx], [field]: value };
    saveData({ ...data, categories: updated });
  };

  const removeCategory = (idx) => {
    if (disabled) return;
    saveData({ ...data, categories: categories.filter((_, i) => i !== idx) });
  };

  const total = categories.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  return (
    <div>
      <SectionHeader
        title="Use of Proceeds"
        description="How will investment funds be allocated? Include timing and milestones."
        status={status}
        saving={saving}
        lastSaved={lastSaved}
      />

      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: B.text, margin: 0 }}>Allocation Categories</h3>
          <button onClick={addCategory} disabled={disabled || categories.length >= 10} style={{ ...buttonSecondary, padding: '4px 12px', fontSize: 12 }}>
            + Add Category
          </button>
        </div>

        {categories.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: B.textMuted, fontSize: 13, fontFamily: font }}>
            No categories added yet. Click "Add Category" to start.
          </div>
        )}

        {categories.map((cat, i) => (
          <div key={i} style={{ padding: '12px', background: B.bgSolid, borderRadius: B.radiusSm, marginBottom: 8 }}>
            <FormGrid cols={2}>
              <FormField label="Category" name="category" type="select" value={cat.category} onChange={(_, v) => updateCategory(i, 'category', v)} disabled={disabled} options={UOP_CATEGORIES} />
              <FormField label="Amount" name="amount" type="number" value={cat.amount} onChange={(_, v) => updateCategory(i, 'amount', v)} disabled={disabled} prefix="$" placeholder="0" />
            </FormGrid>
            <FormGrid cols={2}>
              <FormField label="Timing" name="timing" type="select" value={cat.timing} onChange={(_, v) => updateCategory(i, 'timing', v)} disabled={disabled} options={UOP_TIMINGS} />
              <FormField label="Milestone / KPI Outcome" name="milestone" value={cat.milestone} onChange={(_, v) => updateCategory(i, 'milestone', v)} disabled={disabled} placeholder="What this unlocks" />
            </FormGrid>
            <div style={{ textAlign: 'right' }}>
              <button onClick={() => removeCategory(i)} disabled={disabled} style={{ ...buttonSecondary, padding: '4px 10px', fontSize: 11, color: B.red }}>Remove</button>
            </div>
          </div>
        ))}

        {categories.length > 0 && (
          <div style={{
            padding: '12px 16px', background: B.orangeSoft, borderRadius: B.radius, marginTop: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: B.text, fontFamily: font }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: B.orange, fontFamily: font }}>{formatCurrency(total)}</span>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
