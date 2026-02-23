// Admin email domains — users with these domains get admin access
export const ADMIN_DOMAINS = ['thearcstudio.com', 'boldxenterprises.com'];

// Section definitions for the intake wizard
export const SECTIONS = [
  { key: 'company', number: 1, label: 'Company', description: 'Entity profile, ownership, ecosystem fit' },
  { key: 'transaction', number: 2, label: 'Transaction', description: 'Investment path, structure, terms' },
  { key: 'financials_hist', number: 3, label: 'Historical Financials', description: 'Monthly/TTM financial inputs' },
  { key: 'financials_proj', number: 4, label: 'Projected Financials', description: 'Driver-based projections' },
  { key: 'cap_table', number: 5, label: 'Cap Table', description: 'Ownership, dilution, instruments' },
  { key: 'valuation', number: 6, label: 'Valuation', description: 'DCF, comps, reconciliation' },
  { key: 'use_of_proceeds', number: 7, label: 'Use of Proceeds', description: 'Investment allocation & milestones' },
  { key: 'kpis', number: 8, label: 'KPIs & Operations', description: 'Operational metrics & evidence' },
  { key: 'documents', number: 9, label: 'Documents', description: 'Diligence checklist & uploads' },
  { key: 'summary', number: 10, label: 'Summary & Attestation', description: 'Review & certification' },
];

// Application status enum
export const APP_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  CONDITIONAL_APPROVAL: 'conditional_approval',
  APPROVED: 'approved',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  DISQUALIFIED: 'disqualified',
};

// Section status enum
export const SECTION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  ACCEPTED: 'accepted',
  NEEDS_UPDATE: 'needs_update',
  ADDITIONAL_INFO: 'additional_info_requested',
  LOCKED: 'locked',
};

// Status display labels and colors
export const STATUS_DISPLAY = {
  not_started: { label: 'Not Started', color: '#9A9AB0', bg: 'rgba(154,154,176,0.08)' },
  in_progress: { label: 'In Progress', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
  submitted: { label: 'Submitted', color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
  accepted: { label: 'Accepted', color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
  needs_update: { label: 'Needs Update', color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  additional_info_requested: { label: 'Info Requested', color: '#E8871E', bg: 'rgba(232,135,30,0.08)' },
  locked: { label: 'Locked', color: '#DC2626', bg: 'rgba(220,38,38,0.06)' },
  draft: { label: 'Draft', color: '#9A9AB0', bg: 'rgba(154,154,176,0.08)' },
  under_review: { label: 'Under Review', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
  conditional_approval: { label: 'Conditional', color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  approved: { label: 'Approved', color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
  declined: { label: 'Declined', color: '#DC2626', bg: 'rgba(220,38,38,0.06)' },
  expired: { label: 'Expired', color: '#DC2626', bg: 'rgba(220,38,38,0.06)' },
  disqualified: { label: 'Disqualified', color: '#DC2626', bg: 'rgba(220,38,38,0.06)' },
};

// Dropdown options
export const INDUSTRIES = [
  'Technology', 'Healthcare', 'Financial Services', 'Manufacturing',
  'Retail / E-Commerce', 'Real Estate', 'Energy', 'Transportation & Logistics',
  'Media & Entertainment', 'Education', 'Agriculture', 'Construction',
  'Professional Services', 'Hospitality', 'Telecommunications', 'Other',
];

export const BUSINESS_MODELS = [
  'SaaS', 'B2B', 'B2C', 'B2B2C', 'Marketplace', 'Hardware',
  'Services', 'Subscription', 'Transactional', 'Hybrid', 'Other',
];

export const STAGES = ['Seed', 'Series A', 'Series B', 'Growth', 'Established'];

export const REVENUE_MODELS = [
  'Subscription / Recurring', 'Transactional', 'Project-based',
  'Licensing', 'Advertising', 'Freemium', 'Hybrid', 'Other',
];

export const TRANSACTION_PATHS = [
  { value: 'equity_investment', label: 'Equity Investment' },
  { value: 'ma', label: 'Merger & Acquisition (M&A)' },
  { value: 'both', label: 'Both / Open to Either' },
];

export const EXIT_TYPES = ['IPO', 'Strategic Sale', 'Merger', 'Buyback', 'Hold', 'Other'];

export const CLOSE_WINDOWS = ['30 days', '60 days', '90 days', '6 months', '12+ months'];

export const SECURITY_TYPES = [
  'Common Equity', 'Preferred Equity', 'Convertible Note',
  'SAFE', 'Warrant', 'Revenue-Based Financing', 'Other',
];

export const FOUNDER_INTENTS = ['Stay & Lead', 'Transition to Advisory', 'Full Exit'];

export const CUSTOMER_CONCENTRATIONS = [
  'Top customer < 10% of revenue',
  'Top customer 10-25% of revenue',
  'Top customer 25-50% of revenue',
  'Top customer > 50% of revenue',
];

export const UOP_CATEGORIES = [
  'R&D / Product Development', 'Sales & Marketing', 'Operations',
  'Hiring / Talent', 'Capital Expenditures', 'Working Capital',
  'Debt Repayment', 'Acquisitions', 'Other',
];

export const UOP_TIMINGS = [
  'Immediate', '0-3 months', '3-6 months', '6-12 months', '12+ months',
];

export const DEFAULT_KPIS = [
  'Revenue growth rate', 'Gross margin %', 'EBITDA margin %',
  'Customer acquisition cost (CAC)', 'Lifetime value (LTV)',
  'CAC payback period', 'Churn rate %', 'Net revenue retention %',
  'On-time delivery %', 'Defect / returns %', 'Utilization %',
  'Inventory turns', 'Days sales outstanding (DSO)',
  'Days payable outstanding (DPO)', 'Cash conversion cycle',
];

// Document checklist items
export const DOCUMENT_CHECKLIST = [
  { key: 'pitch_deck', label: 'Pitch Deck', required: true },
  { key: 'executive_summary', label: 'Executive Summary', required: true },
  { key: 'financial_statements_2y', label: 'Financial Statements (2 years)', required: true },
  { key: 'tax_returns_2y', label: 'Tax Returns (2 years)', required: true },
  { key: 'balance_sheet', label: 'Current Balance Sheet', required: true },
  { key: 'pl_statement', label: 'P&L Statement', required: true },
  { key: 'cash_flow_statement', label: 'Cash Flow Statement', required: true },
  { key: 'cap_table_doc', label: 'Cap Table Document', required: true },
  { key: 'articles_incorporation', label: 'Articles of Incorporation', required: true },
  { key: 'operating_agreement', label: 'Operating Agreement', required: false },
  { key: 'bylaws', label: 'Corporate Bylaws', required: false },
  { key: 'shareholder_agreement', label: 'Shareholder Agreement', required: false },
  { key: 'ip_documentation', label: 'IP Documentation (Patents/Trademarks)', required: false },
  { key: 'customer_contracts', label: 'Key Customer Contracts', required: false },
  { key: 'vendor_contracts', label: 'Key Vendor Contracts', required: false },
  { key: 'employee_agreements', label: 'Employee/Contractor Agreements', required: false },
  { key: 'insurance_policies', label: 'Insurance Policies', required: false },
  { key: 'litigation_summary', label: 'Litigation Summary', required: false },
  { key: 'org_chart', label: 'Organization Chart', required: false },
  { key: 'brand_guidelines', label: 'Brand Guidelines / Assets', required: false },
  { key: 'market_research', label: 'Market Research / TAM Analysis', required: false },
  { key: 'other', label: 'Other Supporting Documents', required: false },
];

// US States
export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

// Allowed file types for upload
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.xlsx', '.xls', '.docx', '.png', '.jpg', '.jpeg'];
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Application lifetime
export const APPLICATION_LIFETIME_DAYS = 45;
