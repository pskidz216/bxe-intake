// Per-section validation rules
// Returns an array of error strings; empty array = valid

export function validateCompany(data) {
  const errors = [];
  if (!data.legal_name?.trim()) errors.push('Legal name is required');
  if (!data.industry) errors.push('Industry is required');
  if (!data.business_model) errors.push('Business model is required');
  if (!data.stage) errors.push('Company stage is required');
  if (!data.founder_name?.trim()) errors.push('Founder / CEO name is required');
  if (!data.founder_email?.trim()) errors.push('Founder / CEO email is required');
  if (data.founder_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.founder_email)) {
    errors.push('Founder email is not valid');
  }
  if (data.website && !/^https?:\/\/.+/.test(data.website) && data.website.trim()) {
    errors.push('Website must start with http:// or https://');
  }
  return errors;
}

export function validateTransaction(data) {
  const errors = [];
  if (!data.path) errors.push('Transaction path is required');
  if (!data.investment_amount && data.path !== 'ma') errors.push('Investment amount is required');
  if (!data.security_type && data.path !== 'ma') errors.push('Security type is required');
  return errors;
}

export function validateFinancialsHist(data) {
  const errors = [];
  const months = data.monthly_data || [];
  const hasAny = months.some(m => m.revenue != null && m.revenue !== '');
  if (!hasAny) errors.push('At least one month of historical financials is required');
  return errors;
}

export function validateFinancialsProj(data) {
  const errors = [];
  if (data.revenue_cagr == null || data.revenue_cagr === '') errors.push('Revenue CAGR is required');
  if (data.gross_margin_target == null || data.gross_margin_target === '') errors.push('Gross margin target is required');
  return errors;
}

export function validateCapTable(data) {
  const errors = [];
  if (data.common_shares == null || data.common_shares === '') errors.push('Common shares outstanding is required');
  if (data.pre_money_valuation == null || data.pre_money_valuation === '') errors.push('Pre-money valuation is required');
  return errors;
}

export function validateValuation(data) {
  const errors = [];
  if (data.wacc == null || data.wacc === '') errors.push('WACC / discount rate is required');
  if (data.terminal_growth_rate == null || data.terminal_growth_rate === '') errors.push('Terminal growth rate is required');
  const dcfW = parseFloat(data.dcf_weight) || 0;
  const compsW = parseFloat(data.comps_weight) || 0;
  const precW = parseFloat(data.precedent_weight) || 0;
  if (Math.abs(dcfW + compsW + precW - 100) > 0.01) {
    errors.push('Valuation weights must sum to 100%');
  }
  return errors;
}

export function validateUseOfProceeds(data) {
  const errors = [];
  const cats = data.categories || [];
  const hasAny = cats.some(c => c.category && c.amount);
  if (!hasAny) errors.push('At least one use of proceeds category is required');
  return errors;
}

export function validateKPIs(data) {
  const errors = [];
  const kpis = data.kpis || [];
  const hasAny = kpis.some(k => k.current_value?.trim());
  if (!hasAny) errors.push('At least one KPI with a current value is required');
  return errors;
}

export function validateDocuments(data, documents) {
  const errors = [];
  const required = [
    'pitch_deck', 'executive_summary', 'financial_statements_2y',
    'tax_returns_2y', 'balance_sheet', 'pl_statement',
    'cash_flow_statement', 'cap_table_doc', 'articles_incorporation',
  ];
  for (const key of required) {
    const hasFile = documents.some(d => d.checklist_item === key && !d.deleted_at);
    if (!hasFile) {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      errors.push(`Required document missing: ${label}`);
    }
  }
  return errors;
}

export function validateSummary(data) {
  const errors = [];
  if (!data.attested) errors.push('You must check the attestation box');
  if (!data.attested_name?.trim()) errors.push('Your full name is required for attestation');
  if (!data.attested_title?.trim()) errors.push('Your title is required for attestation');
  return errors;
}

// Map section keys to their validators
export const SECTION_VALIDATORS = {
  company: validateCompany,
  transaction: validateTransaction,
  financials_hist: validateFinancialsHist,
  financials_proj: validateFinancialsProj,
  cap_table: validateCapTable,
  valuation: validateValuation,
  use_of_proceeds: validateUseOfProceeds,
  kpis: validateKPIs,
  documents: validateDocuments,
  summary: validateSummary,
};
