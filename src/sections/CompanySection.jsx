import { useSection } from '../hooks/useSection';
import SectionHeader from '../components/SectionHeader';
import FormField from '../components/FormField';
import FormGrid from '../components/FormGrid';
import GlassCard from '../components/GlassCard';
import {
  INDUSTRIES, BUSINESS_MODELS, STAGES, REVENUE_MODELS,
  CUSTOMER_CONCENTRATIONS, US_STATES,
} from '../utils/constants';

export default function CompanySection({ applicationId, userId, disabled }) {
  const { data, status, saving, lastSaved, saveField } = useSection(applicationId, 'company', userId);

  const handleChange = (name, value) => {
    if (disabled) return;
    saveField(name, value);
  };

  return (
    <div>
      <SectionHeader
        title="Company Profile"
        description="Tell us about your company, its leadership, and how it fits into the BXE ecosystem."
        status={status}
        saving={saving}
        lastSaved={lastSaved}
      />

      <GlassCard style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#1A1A2E' }}>Entity Information</h3>
        <FormGrid cols={2}>
          <FormField label="Legal Name" name="legal_name" value={data.legal_name} onChange={handleChange} required disabled={disabled} placeholder="Full legal entity name" />
          <FormField label="DBA (Doing Business As)" name="dba" value={data.dba} onChange={handleChange} disabled={disabled} placeholder="If different from legal name" />
        </FormGrid>
        <FormGrid cols={3}>
          <FormField label="Country" name="country" type="select" value={data.country} onChange={handleChange} disabled={disabled} options={['United States', 'Canada', 'United Kingdom', 'Other']} />
          <FormField label="State" name="state" type="select" value={data.state} onChange={handleChange} disabled={disabled} options={US_STATES} />
          <FormField label="Website" name="website" type="url" value={data.website} onChange={handleChange} disabled={disabled} placeholder="https://company.com" />
        </FormGrid>
        <FormGrid cols={3}>
          <FormField label="Industry" name="industry" type="select" value={data.industry} onChange={handleChange} required disabled={disabled} options={INDUSTRIES} />
          <FormField label="Business Model" name="business_model" type="select" value={data.business_model} onChange={handleChange} required disabled={disabled} options={BUSINESS_MODELS} />
          <FormField label="Stage" name="stage" type="select" value={data.stage} onChange={handleChange} required disabled={disabled} options={STAGES} />
        </FormGrid>
      </GlassCard>

      <GlassCard style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#1A1A2E' }}>Leadership</h3>
        <FormGrid cols={2}>
          <FormField label="Founder / CEO Name" name="founder_name" value={data.founder_name} onChange={handleChange} required disabled={disabled} />
          <FormField label="Founder / CEO Email" name="founder_email" type="email" value={data.founder_email} onChange={handleChange} required disabled={disabled} />
        </FormGrid>
        <FormGrid cols={2}>
          <FormField label="Founder Phone" name="founder_phone" type="tel" value={data.founder_phone} onChange={handleChange} disabled={disabled} />
          <FormField label="CEO Name (if different)" name="ceo_name" value={data.ceo_name} onChange={handleChange} disabled={disabled} />
        </FormGrid>
        <FormGrid cols={2}>
          <FormField label="Headcount" name="headcount" type="number" value={data.headcount} onChange={handleChange} disabled={disabled} placeholder="Total employees" />
          <FormField label="Revenue Model" name="revenue_model" type="select" value={data.revenue_model} onChange={handleChange} disabled={disabled} options={REVENUE_MODELS} />
        </FormGrid>
      </GlassCard>

      <GlassCard>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#1A1A2E' }}>Business Details</h3>
        <FormField label="Top Products / Services" name="top_products" type="textarea" value={data.top_products} onChange={handleChange} disabled={disabled} placeholder="Describe your primary products or services" />
        <FormField label="Customer Segments" name="customer_segments" type="textarea" value={data.customer_segments} onChange={handleChange} disabled={disabled} placeholder="Who are your target customers?" />
        <FormField label="Customer Concentration" name="customer_concentration" type="select" value={data.customer_concentration} onChange={handleChange} disabled={disabled} options={CUSTOMER_CONCENTRATIONS} />
        <FormField label="Key Differentiators" name="key_differentiators" type="textarea" value={data.key_differentiators} onChange={handleChange} disabled={disabled} placeholder="What sets your company apart from competitors?" />
        <FormField label="BXE Ecosystem Fit" name="bxe_ecosystem_fit" type="textarea" value={data.bxe_ecosystem_fit} onChange={handleChange} disabled={disabled} placeholder="How do you see your company fitting into the BXE ecosystem?" />
      </GlassCard>
    </div>
  );
}
