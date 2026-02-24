// BXE Intake — Vibrant Glassmorphism Theme (matches portal)
export const B = {
  // Brand
  orange: "#E8871E", orangeLight: "#F5A623", orangeDark: "#D4791A",
  orangeSoft: "rgba(232,135,30,0.10)", orangeSofter: "rgba(232,135,30,0.05)",
  orangeGlow: "rgba(232,135,30,0.30)",

  // Base
  black: "#1a1a2e", white: "#FFFFFF",
  bg: "linear-gradient(135deg, #e0c3fc 0%, #c9d6ff 30%, #d4eaf7 50%, #f0d5e0 70%, #fce4d6 100%)",
  bgSolid: "#e8dff5",

  // Glass surfaces — true frosted glass
  glass: "rgba(255,255,255,0.35)", glassStrong: "rgba(255,255,255,0.50)", glassSubtle: "rgba(255,255,255,0.22)",
  glassHover: "rgba(255,255,255,0.60)",
  glassBorder: "rgba(255,255,255,0.65)", glassBorderSoft: "rgba(255,255,255,0.45)",

  // Blur — strong for real glass
  blur: "blur(24px)", blurLg: "blur(40px)", blurSm: "blur(16px)",

  // Text — dark on light
  text: "#1a1a2e", textSecondary: "rgba(26,26,46,0.65)", textMuted: "rgba(26,26,46,0.40)", textDim: "rgba(26,26,46,0.25)",

  // Borders — glass edge highlights
  border: "rgba(255,255,255,0.50)", borderLight: "rgba(255,255,255,0.35)", borderOuter: "rgba(0,0,0,0.06)",

  // Functional
  green: "#10B981", greenSoft: "rgba(16,185,129,0.12)",
  red: "#EF4444", redSoft: "rgba(239,68,68,0.12)",
  blue: "#3B82F6", blueSoft: "rgba(59,130,246,0.12)",
  yellow: "#F59E0B", yellowSoft: "rgba(245,158,11,0.12)",

  // Shadows — soft glass-style
  shadow: "0 2px 8px rgba(0,0,0,0.06)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
  shadowLg: "0 8px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.05)",
  shadowXl: "0 20px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)",

  // Radius — rounded glass
  radius: 16, radiusSm: 12, radiusLg: 24, radiusXl: 32,
};

export const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// Reusable inline style fragments
export const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid rgba(255,255,255,0.50)',
  borderRadius: B.radiusSm,
  fontSize: 14,
  fontFamily: font,
  color: B.text,
  background: 'rgba(255,255,255,0.35)',
  backdropFilter: B.blurSm,
  WebkitBackdropFilter: B.blurSm,
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
};

export const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: B.textSecondary,
  marginBottom: 6,
  fontFamily: font,
};

export const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%237A7A9A' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: 36,
};

export const textareaStyle = {
  ...inputStyle,
  minHeight: 80,
  resize: 'vertical',
  lineHeight: 1.5,
};

export const buttonPrimary = {
  padding: '10px 24px',
  background: `linear-gradient(135deg, ${B.orange}, ${B.orangeLight})`,
  color: B.white,
  border: 'none',
  borderRadius: B.radiusSm,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: font,
  cursor: 'pointer',
  transition: 'opacity 0.2s, transform 0.1s',
  boxShadow: `0 4px 16px ${B.orangeGlow}`,
};

export const buttonSecondary = {
  padding: '10px 24px',
  background: 'rgba(255,255,255,0.35)',
  color: B.text,
  border: '1px solid rgba(255,255,255,0.50)',
  borderRadius: B.radiusSm,
  fontSize: 14,
  fontWeight: 500,
  fontFamily: font,
  cursor: 'pointer',
  transition: 'background 0.2s',
  backdropFilter: B.blurSm,
  WebkitBackdropFilter: B.blurSm,
};
