import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { B, font, buttonPrimary, buttonSecondary } from '../theme';
import StepIndicator from '../components/StepIndicator';
import SectionFileUpload from '../components/SectionFileUpload';
import { SECTIONS } from '../utils/constants';
import { SECTION_VALIDATORS } from '../utils/validators';
import { getAllLocalSectionData, clearAllLocalSectionData } from '../hooks/useLocalSection';
import { supabase } from '../lib/supabase';
import AuthModal from '../components/AuthModal';

// Section components
import CompanySection from '../sections/CompanySection';
import TransactionSection from '../sections/TransactionSection';
import FinancialsHistSection from '../sections/FinancialsHistSection';
import FinancialsProjSection from '../sections/FinancialsProjSection';
import CapTableSection from '../sections/CapTableSection';
import ValuationSection from '../sections/ValuationSection';
import UseOfProceedsSection from '../sections/UseOfProceedsSection';
import KPIsSection from '../sections/KPIsSection';
import DocumentsSection from '../sections/DocumentsSection';
import SummarySection from '../sections/SummarySection';

const SECTION_COMPONENTS = {
  company: CompanySection,
  transaction: TransactionSection,
  financials_hist: FinancialsHistSection,
  financials_proj: FinancialsProjSection,
  cap_table: CapTableSection,
  valuation: ValuationSection,
  use_of_proceeds: UseOfProceedsSection,
  kpis: KPIsSection,
  documents: DocumentsSection,
  summary: SummarySection,
};

// Define which sections get inline file upload and what the hints are
const SECTION_FILE_HINTS = {
  company: {
    title: 'Company Documents',
    description: 'Upload any company-related documents that support this section.',
    hint: 'Helpful: Pitch deck, executive summary, org chart, articles of incorporation, operating agreements',
  },
  transaction: {
    title: 'Transaction Documents',
    description: 'Upload deal-related documents or term sheets.',
    hint: 'Helpful: Term sheets, LOIs, existing agreements, deal memos',
  },
  financials_hist: {
    title: 'Historical Financial Documents',
    description: 'Upload your historical financial data to supplement the grid above.',
    hint: 'Helpful: P&L statements, balance sheets, cash flow statements, tax returns, bank statements (PDF or Excel)',
  },
  financials_proj: {
    title: 'Projection Documents',
    description: 'Upload any projection models or forecasting spreadsheets.',
    hint: 'Helpful: Financial models (Excel), revenue projections, budget spreadsheets',
  },
  cap_table: {
    title: 'Cap Table Documents',
    description: 'Upload your detailed cap table or equity structure documents.',
    hint: 'Helpful: Cap table spreadsheet (Excel), SAFE/convertible note documents, stock certificates',
  },
  valuation: {
    title: 'Valuation Documents',
    description: 'Upload valuation reports, analyses, or supporting research.',
    hint: 'Helpful: 409A valuation reports, DCF models (Excel), comparable company analysis, market research',
  },
  use_of_proceeds: {
    title: 'Use of Proceeds Documents',
    description: 'Upload any supporting budgets or allocation plans.',
    hint: 'Helpful: Detailed budget spreadsheet, milestone roadmap, project plans',
  },
  kpis: {
    title: 'KPI & Operations Documents',
    description: 'Upload dashboards, analytics exports, or operational reports.',
    hint: 'Helpful: Analytics dashboards (PDF), KPI tracking spreadsheets, operational reports',
  },
};

/**
 * Validate a section's data using the SECTION_VALIDATORS map.
 * Special cases: 'documents' skips file-based validation in public mode.
 */
function validateCurrentSection(sectionKey) {
  const validator = SECTION_VALIDATORS[sectionKey];
  if (!validator) return [];

  const localData = getAllLocalSectionData();
  const sectionData = localData[sectionKey] || {};

  // Documents section: in public mode, file uploads happen after auth,
  // so skip the file-based validation. Just let them through.
  if (sectionKey === 'documents') {
    return [];
  }

  return validator(sectionData);
}

/**
 * Compute the highest step index where all sections up to (and including)
 * that step have valid data. Used to restore state for returning users.
 */
function computeHighestCompletedStep() {
  const localData = getAllLocalSectionData();
  let highest = -1;

  for (let i = 0; i < SECTIONS.length; i++) {
    const key = SECTIONS[i].key;
    const validator = SECTION_VALIDATORS[key];

    // Skip documents validation in public mode
    if (key === 'documents') {
      highest = i;
      continue;
    }

    if (validator) {
      const data = localData[key] || {};
      // Only count as completed if there's actually data AND it passes validation
      if (Object.keys(data).length > 0 && validator(data).length === 0) {
        highest = i;
      } else {
        break; // Stop at first incomplete section
      }
    }
  }

  return highest;
}

/**
 * PublicApplicationPage — guided step-by-step form wizard.
 * Takes users through one section at a time with clear progression.
 * Each section has an optional inline file upload for supporting documents.
 * Users must complete each section before advancing to the next.
 * Auth happens only at submit.
 */
export default function PublicApplicationPage({ user, auth }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); // 0-indexed
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Validation state
  const [validationErrors, setValidationErrors] = useState([]);
  const [highestCompletedStep, setHighestCompletedStep] = useState(() => computeHighestCompletedStep());

  // File uploads stored per section in local state (File objects can't go in localStorage)
  const [sectionFiles, setSectionFiles] = useState({});

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const activeSection = SECTIONS[currentStep];
  const ActiveComponent = SECTION_COMPONENTS[activeSection.key];
  const fileHint = SECTION_FILE_HINTS[activeSection.key];

  // ── Navigation with validation ──

  const goNext = useCallback(() => {
    if (currentStep >= SECTIONS.length - 1) return;

    const errors = validateCurrentSection(SECTIONS[currentStep].key);
    if (errors.length > 0) {
      setValidationErrors(errors);
      // Scroll to the error display
      setTimeout(() => {
        const errorEl = document.getElementById('validation-errors');
        if (errorEl) errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    setValidationErrors([]);
    setHighestCompletedStep(prev => Math.max(prev, currentStep));
    setCurrentStep(prev => prev + 1);
  }, [currentStep]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setValidationErrors([]);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((idx) => {
    // Always allow going backward or to current step
    if (idx <= currentStep) {
      setValidationErrors([]);
      setCurrentStep(idx);
      return;
    }
    // Only allow jumping forward to already-completed steps (or the next unlocked step)
    if (idx <= highestCompletedStep + 1) {
      setValidationErrors([]);
      setCurrentStep(idx);
    }
    // Otherwise: step is locked, ignore the click
  }, [currentStep, highestCompletedStep]);

  // Handle file changes for a section
  const handleFilesChange = useCallback((sectionKey, files) => {
    setSectionFiles(prev => ({ ...prev, [sectionKey]: files }));
  }, []);

  // Submit = validate summary section first, then show auth modal
  const handleSubmitClick = () => {
    const errors = validateCurrentSection('summary');
    if (errors.length > 0) {
      setValidationErrors(errors);
      setTimeout(() => {
        const errorEl = document.getElementById('validation-errors');
        if (errorEl) errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setValidationErrors([]);
    setShowAuthModal(true);
  };

  // After successful authentication, persist all local data + files to Supabase
  const handleAuthSuccess = async (authenticatedUser) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const localData = getAllLocalSectionData();
      const companyData = localData.company || {};

      // 1. Create the application
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 45);

      const { data: app, error: appErr } = await supabase
        .from('intake_applications')
        .insert({
          user_id: authenticatedUser.id,
          company_name: companyData.legal_name || companyData.dba || null,
          company_website: companyData.website || null,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          current_section: 10,
        })
        .select()
        .single();

      if (appErr) {
        // Friendly error if tables don't exist yet
        if (appErr.code === '42P01') {
          throw new Error('The application database has not been configured yet. Please contact the administrator.');
        }
        throw new Error('Failed to create application: ' + appErr.message);
      }

      // 2. Create all 10 section rows with the local data
      const sectionRows = SECTIONS.map(sec => ({
        application_id: app.id,
        section_key: sec.key,
        section_number: sec.number,
        status: localData[sec.key] && Object.keys(localData[sec.key]).length > 0
          ? 'submitted' : 'not_started',
        data: localData[sec.key] || {},
        last_saved_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
      }));

      const { error: secErr } = await supabase
        .from('intake_sections')
        .insert(sectionRows);

      if (secErr) throw new Error('Failed to save sections: ' + secErr.message);

      // 3. Upload any files that were attached to sections
      const allFiles = Object.entries(sectionFiles);
      for (const [secKey, files] of allFiles) {
        for (const f of files) {
          if (!f.file) continue;
          const storagePath = `${app.id}/${secKey}/${Date.now()}_${f.name}`;

          const { error: uploadErr } = await supabase.storage
            .from('intake-documents')
            .upload(storagePath, f.file);

          if (!uploadErr) {
            await supabase.from('intake_documents').insert({
              application_id: app.id,
              section_key: secKey,
              checklist_item: null,
              file_name: f.name,
              file_size: f.size,
              file_type: f.type,
              storage_path: storagePath,
              scan_status: 'pending',
              uploaded_by: authenticatedUser.id,
            });
          }
        }
      }

      // 4. Audit log
      const totalFiles = Object.values(sectionFiles).reduce((sum, arr) => sum + arr.length, 0);
      await supabase.from('intake_audit_log').insert({
        application_id: app.id,
        user_id: authenticatedUser.id,
        action: 'application_submitted',
        details: {
          source: 'public_form',
          sections_with_data: Object.keys(localData).length,
          files_uploaded: totalFiles,
        },
      });

      // 5. Send email summaries (fire-and-forget — don't block submission if email fails)
      try {
        await supabase.functions.invoke('send-intake-summary', {
          body: {
            applicationId: app.id,
            applicantEmail: authenticatedUser.email,
            applicantName: authenticatedUser.user_metadata?.full_name || companyData.founder_name || '',
            companyName: companyData.legal_name || companyData.dba || '',
          },
        });
      } catch (emailErr) {
        console.error('Email notification error:', emailErr);
      }

      // 6. Clear local storage
      clearAllLocalSectionData();

      // 7. Navigate to submitted page
      setSubmitting(false);
      navigate(`/submitted/${app.id}`);

    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  const isLastStep = currentStep === SECTIONS.length - 1;
  const isFirstStep = currentStep === 0;

  // Count total attached files across all sections
  const totalAttachedFiles = Object.values(sectionFiles).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* Step Indicator */}
      <StepIndicator
        currentStep={currentStep + 1}
        totalSteps={SECTIONS.length}
        sectionLabel={activeSection.label}
        sectionDescription={activeSection.description}
      />

      {/* Section quick-jump pills */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24,
      }}>
        {SECTIONS.map((sec, idx) => {
          const isCurrent = idx === currentStep;
          const isCompleted = idx <= highestCompletedStep;
          const isLocked = idx > currentStep && idx > highestCompletedStep + 1;
          const isVisited = (() => {
            try {
              const stored = localStorage.getItem(`bxe_intake_${sec.key}`);
              return stored && Object.keys(JSON.parse(stored)).length > 0;
            } catch { return false; }
          })();
          const hasFiles = (sectionFiles[sec.key] || []).length > 0;

          return (
            <button
              key={sec.key}
              onClick={() => !isLocked && goToStep(idx)}
              style={{
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: isCurrent ? 700 : 500,
                fontFamily: font,
                color: isLocked
                  ? B.textMuted
                  : isCurrent
                    ? B.white
                    : isCompleted
                      ? B.green
                      : isVisited
                        ? B.orange
                        : B.textMuted,
                background: isLocked
                  ? B.bgSolid
                  : isCurrent
                    ? `linear-gradient(135deg, ${B.orange}, ${B.orangeLight})`
                    : isCompleted
                      ? B.greenSoft
                      : isVisited
                        ? B.orangeSoft
                        : B.bgSolid,
                border: 'none',
                borderRadius: 20,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                position: 'relative',
                opacity: isLocked ? 0.4 : 1,
              }}
            >
              {isCompleted && !isCurrent && (
                <span style={{ marginRight: 3 }}>&#10003;</span>
              )}
              {sec.number}. {sec.label}
              {hasFiles && (
                <span style={{
                  display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                  background: B.green, marginLeft: 4, verticalAlign: 'middle',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Active section — pass null applicationId for local mode */}
      {ActiveComponent && (
        <ActiveComponent
          applicationId={null}
          userId={null}
          disabled={false}
        />
      )}

      {/* Inline file upload for this section (except Documents & Summary which handle their own) */}
      {fileHint && activeSection.key !== 'documents' && activeSection.key !== 'summary' && (
        <SectionFileUpload
          sectionKey={activeSection.key}
          title={fileHint.title}
          description={fileHint.description}
          hint={fileHint.hint}
          files={sectionFiles[activeSection.key] || []}
          onFilesChange={(files) => handleFilesChange(activeSection.key, files)}
          disabled={false}
        />
      )}

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div
          id="validation-errors"
          style={{
            marginTop: 16,
            padding: '14px 18px',
            background: B.redSoft,
            borderRadius: B.radiusSm,
            border: `1px solid ${B.red}20`,
          }}
        >
          <div style={{
            fontSize: 13, fontWeight: 700, color: B.red,
            fontFamily: font, marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 15 }}>&#9888;</span>
            Please complete the following before continuing:
          </div>
          {validationErrors.map((err, i) => (
            <div key={i} style={{
              fontSize: 12, color: B.red, fontFamily: font,
              padding: '3px 0 3px 20px',
              lineHeight: 1.5,
            }}>
              &bull; {err}
            </div>
          ))}
        </div>
      )}

      {/* File count indicator */}
      {totalAttachedFiles > 0 && (
        <div style={{
          marginTop: 16,
          padding: '8px 14px',
          background: B.greenSoft,
          borderRadius: B.radiusSm,
          fontSize: 12,
          color: B.green,
          fontFamily: font,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ fontSize: 14 }}>&#128206;</span>
          {totalAttachedFiles} file{totalAttachedFiles !== 1 ? 's' : ''} attached across your application
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 32,
        paddingTop: 20,
        borderTop: `1px solid ${B.border}`,
        paddingBottom: 40,
      }}>
        <button
          onClick={goPrev}
          disabled={isFirstStep}
          style={{
            ...buttonSecondary,
            opacity: isFirstStep ? 0.4 : 1,
            cursor: isFirstStep ? 'not-allowed' : 'pointer',
            padding: '12px 28px',
          }}
        >
          &#8592; Previous
        </button>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Step counter */}
          <span style={{ fontSize: 12, color: B.textMuted, fontFamily: font, marginRight: 8 }}>
            {currentStep + 1} / {SECTIONS.length}
          </span>

          {isLastStep ? (
            <button
              onClick={handleSubmitClick}
              disabled={submitting}
              style={{
                ...buttonPrimary,
                padding: '12px 32px',
                fontSize: 15,
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Submitting...' : 'Create Account & Submit'}
            </button>
          ) : (
            <button
              onClick={goNext}
              style={{
                ...buttonPrimary,
                padding: '12px 28px',
              }}
            >
              Continue &#8594;
            </button>
          )}
        </div>
      </div>

      {submitError && (
        <div style={{
          marginTop: 12,
          padding: '10px 16px',
          background: B.redSoft,
          borderRadius: B.radiusSm,
          color: B.red,
          fontSize: 13,
          fontFamily: font,
        }}>
          {submitError}
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          auth={auth}
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
