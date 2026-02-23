import { B, font } from '../theme';
import { SECTIONS } from '../utils/constants';

/**
 * StepIndicator — horizontal step progress bar for the guided wizard.
 * Shows numbered dots with the current step highlighted.
 */
export default function StepIndicator({ currentStep, totalSteps, sectionLabel, sectionDescription }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {/* Step counter + label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: B.orange, fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Step {currentStep} of {totalSteps}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: B.text, fontFamily: font, margin: 0 }}>
            {sectionLabel}
          </h2>
          {sectionDescription && (
            <p style={{ fontSize: 13, color: B.textMuted, fontFamily: font, marginTop: 4, margin: '4px 0 0' }}>
              {sectionDescription}
            </p>
          )}
        </div>
        <div style={{
          fontSize: 13, fontWeight: 600, color: B.textSecondary, fontFamily: font,
          padding: '6px 14px', background: B.orangeSoft, borderRadius: 20,
        }}>
          {Math.round((currentStep / totalSteps) * 100)}% complete
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        display: 'flex',
        gap: 4,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '100%',
              borderRadius: 3,
              background: i < currentStep
                ? `linear-gradient(90deg, ${B.orange}, ${B.orangeLight})`
                : i === currentStep
                  ? B.orangeSoft
                  : B.border,
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
