import { useState, useEffect } from 'react';
import { useSection } from '../hooks/useSection';
import { getAllLocalSectionData } from '../hooks/useLocalSection';
import SectionHeader from '../components/SectionHeader';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { B, font, inputStyle, labelStyle } from '../theme';
import { SECTIONS } from '../utils/constants';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { supabase } from '../lib/supabase';

export default function SummarySection({ applicationId, userId, disabled }) {
  const { data, status, saving, lastSaved, saveField } = useSection(applicationId, 'summary', userId);
  const [allSections, setAllSections] = useState([]);

  const isLocalMode = !applicationId;

  // Load all section data for summary
  useEffect(() => {
    if (isLocalMode) {
      // In local mode, load from localStorage
      const localData = getAllLocalSectionData();
      const localSections = SECTIONS.map(sec => ({
        section_key: sec.key,
        section_number: sec.number,
        data: localData[sec.key] || {},
        status: localData[sec.key] && Object.keys(localData[sec.key]).length > 0
          ? 'in_progress' : 'not_started',
      }));
      setAllSections(localSections);
    } else {
      // Authenticated mode — load from Supabase
      async function loadAll() {
        const { data: sections } = await supabase
          .from('intake_sections')
          .select('*')
          .eq('application_id', applicationId)
          .order('section_number');
        if (sections) setAllSections(sections);
      }
      loadAll();
    }
  }, [applicationId, isLocalMode]);

  const getSectionData = (key) => {
    const sec = allSections.find(s => s.section_key === key);
    return sec?.data || {};
  };

  const company = getSectionData('company');
  const transaction = getSectionData('transaction');
  const capTable = getSectionData('cap_table');

  const handleChange = (name, value) => {
    if (disabled) return;
    saveField(name, value);
  };

  const summaryRow = (label, value) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: '8px 0',
      borderBottom: `1px solid ${B.borderLight}`,
    }}>
      <span style={{ fontSize: 13, color: B.textSecondary, fontFamily: font }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: B.text, fontFamily: font }}>{value || '\u2014'}</span>
    </div>
  );

  return (
    <div>
      <SectionHeader
        title="Summary & Attestation"
        description="Review your application summary and certify that all information is accurate."
        status={status}
        saving={saving}
        lastSaved={lastSaved}
      />

      {/* Section completion overview */}
      <GlassCard style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: B.text }}>Section Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {SECTIONS.filter(s => s.key !== 'summary').map(sec => {
            const found = allSections.find(s => s.section_key === sec.key);
            return (
              <div key={sec.key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', background: B.bgSolid, borderRadius: B.radiusSm,
              }}>
                <span style={{ fontSize: 13, color: B.text, fontFamily: font }}>{sec.label}</span>
                <StatusBadge status={found?.status || 'not_started'} />
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Key information summary */}
      <GlassCard style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: B.text }}>Application Summary</h3>
        {summaryRow('Company', company.legal_name)}
        {summaryRow('Industry', company.industry)}
        {summaryRow('Stage', company.stage)}
        {summaryRow('Transaction Path', transaction.path?.replace(/_/g, ' ')?.replace(/\b\w/g, c => c.toUpperCase()))}
        {summaryRow('Investment Amount', formatCurrency(transaction.investment_amount))}
        {summaryRow('Pre-Money Valuation', formatCurrency(capTable.pre_money_valuation || transaction.pre_money_valuation))}
        {summaryRow('Security Type', transaction.security_type)}
        {summaryRow('Founder Intent', transaction.founder_intent)}
      </GlassCard>

      {/* Attestation */}
      <GlassCard>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: B.text }}>Attestation</h3>
        <div style={{
          padding: '16px', background: B.orangeSoft, borderRadius: B.radius, marginBottom: 20,
          fontSize: 13, color: B.textSecondary, fontFamily: font, lineHeight: 1.6,
        }}>
          By checking the box below and typing your name, you certify that all information
          provided in this application is true, complete, and accurate to the best of your
          knowledge. You understand that providing false or misleading information may result
          in disqualification from the current opportunity.
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer' }}>
            <input
              type="checkbox"
              checked={!!data.attested}
              onChange={e => handleChange('attested', e.target.checked)}
              disabled={disabled}
              style={{ width: 18, height: 18, accentColor: B.orange }}
            />
            <span style={{ fontSize: 14, fontWeight: 500, color: B.text, fontFamily: font }}>
              I certify that all information in this application is true and accurate
            </span>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Full Name <span style={{ color: B.red }}>*</span></label>
            <input
              type="text"
              value={data.attested_name || ''}
              onChange={e => handleChange('attested_name', e.target.value)}
              placeholder="Type your full name"
              disabled={disabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Title <span style={{ color: B.red }}>*</span></label>
            <input
              type="text"
              value={data.attested_title || ''}
              onChange={e => handleChange('attested_title', e.target.value)}
              placeholder="CEO, Founder, etc."
              disabled={disabled}
              style={inputStyle}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
