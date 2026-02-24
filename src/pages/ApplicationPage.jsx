import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { B, font, buttonPrimary, buttonSecondary } from '../theme';
import SectionNav from '../components/SectionNav';
import DeadlineBanner from '../components/DeadlineBanner';
import { SECTIONS } from '../utils/constants';
import { useDeadline } from '../hooks/useDeadline';

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

function useIsMobile(breakpoint = 768) {
  const [m, setM] = useState(typeof window !== 'undefined' && window.innerWidth <= breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const h = (e) => setM(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [breakpoint]);
  return m;
}

export default function ApplicationPage({ appHook, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentApp, sections, loading, loadApplication, updateCurrentSection, submitApplication } = appHook;
  const [activeSection, setActiveSection] = useState('company');
  const { isExpired } = useDeadline(currentApp?.expires_at);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (id) loadApplication(id);
  }, [id, loadApplication]);

  useEffect(() => {
    if (currentApp) {
      const sec = SECTIONS.find(s => s.number === currentApp.current_section);
      if (sec) setActiveSection(sec.key);
    }
  }, [currentApp]);

  const handleSectionSelect = useCallback((key) => {
    setActiveSection(key);
    const sec = SECTIONS.find(s => s.key === key);
    if (sec && currentApp) {
      updateCurrentSection(currentApp.id, sec.number);
    }
  }, [currentApp, updateCurrentSection]);

  const goNext = useCallback(() => {
    const current = SECTIONS.find(s => s.key === activeSection);
    if (current && current.number < SECTIONS.length) {
      const next = SECTIONS.find(s => s.number === current.number + 1);
      if (next) handleSectionSelect(next.key);
    }
  }, [activeSection, handleSectionSelect]);

  const goPrev = useCallback(() => {
    const current = SECTIONS.find(s => s.key === activeSection);
    if (current && current.number > 1) {
      const prev = SECTIONS.find(s => s.number === current.number - 1);
      if (prev) handleSectionSelect(prev.key);
    }
  }, [activeSection, handleSectionSelect]);

  const handleSubmit = async () => {
    const ok = await submitApplication(currentApp.id);
    if (ok) navigate(`/submitted/${currentApp.id}`);
  };

  if (loading || !currentApp) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: 16, color: B.textMuted, fontFamily: font }}>Loading application...</div>
      </div>
    );
  }

  const ActiveComponent = SECTION_COMPONENTS[activeSection];
  const currentSectionMeta = SECTIONS.find(s => s.key === activeSection);
  const isReadOnly = isExpired || currentApp.status === 'submitted' || currentApp.status === 'disqualified';

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: 'calc(100vh - 80px)', gap: 0 }}>
      {/* Sidebar */}
      <SectionNav
        sections={sections}
        currentSection={activeSection}
        onSelect={handleSectionSelect}
        isMobile={isMobile}
      />

      {/* Main content */}
      <div style={{ flex: 1, padding: isMobile ? '16px' : '20px 32px', overflowY: 'auto' }}>
        {/* Deadline banner */}
        <div style={{ marginBottom: 16 }}>
          <DeadlineBanner expiresAt={currentApp.expires_at} />
        </div>

        {isReadOnly && (
          <div style={{
            padding: '10px 16px',
            background: B.yellowSoft,
            borderRadius: B.radiusSm,
            marginBottom: 16,
            fontSize: 13,
            color: B.yellow,
            fontFamily: font,
            fontWeight: 500,
          }}>
            {isExpired
              ? 'This application has expired and is read-only.'
              : currentApp.status === 'disqualified'
                ? 'This application has been disqualified and is read-only.'
                : 'This application has been submitted and is read-only.'}
          </div>
        )}

        {/* Active section */}
        {ActiveComponent && (
          <ActiveComponent
            applicationId={currentApp.id}
            userId={user.id}
            disabled={isReadOnly}
          />
        )}

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 32,
          paddingTop: 20,
          borderTop: `1px solid ${B.border}`,
        }}>
          <button
            onClick={goPrev}
            disabled={currentSectionMeta?.number === 1}
            style={{
              ...buttonSecondary,
              opacity: currentSectionMeta?.number === 1 ? 0.4 : 1,
              cursor: currentSectionMeta?.number === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            &#8592; Previous
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            {activeSection === 'summary' && !isReadOnly ? (
              <button onClick={handleSubmit} style={buttonPrimary}>
                Submit Application
              </button>
            ) : currentSectionMeta?.number < SECTIONS.length ? (
              <button onClick={goNext} style={buttonPrimary}>
                Next &#8594;
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
