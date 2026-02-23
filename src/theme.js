// BXE Design Tokens — Light Glassmorphism Theme
// Copied from bxe-travel BoldXTravel.jsx (lines 201-226)
export const B = {
  orange: "#E8871E", orangeLight: "#F5A623", orangeDark: "#D4791A",
  orangeSoft: "rgba(232,135,30,0.08)", orangeSofter: "rgba(232,135,30,0.04)",
  orangeGlow: "rgba(232,135,30,0.25)",
  black: "#1A1A2E", white: "#FFFFFF",
  bg: "linear-gradient(135deg, #F0F2F5 0%, #E8EDF4 30%, #FFF5EB 60%, #F0F2F5 100%)",
  bgSolid: "#F0F2F5",
  glass: "rgba(255,255,255,0.55)", glassStrong: "rgba(255,255,255,0.72)", glassSubtle: "rgba(255,255,255,0.35)",
  glassBorder: "rgba(255,255,255,0.6)", glassBorderSoft: "rgba(255,255,255,0.4)",
  blur: "blur(20px)", blurLg: "blur(32px)", blurSm: "blur(12px)",
  text: "#1A1A2E", textSecondary: "#4A4A6A", textMuted: "#7A7A9A", textDim: "#9A9AB0",
  border: "rgba(0,0,0,0.08)", borderLight: "rgba(0,0,0,0.05)",
  green: "#16A34A", greenSoft: "rgba(22,163,74,0.08)",
  red: "#DC2626", redSoft: "rgba(220,38,38,0.06)",
  blue: "#2563EB", blueSoft: "rgba(37,99,235,0.08)",
  yellow: "#D97706", yellowSoft: "rgba(217,119,6,0.08)",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
  shadowLg: "0 8px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)",
  shadowXl: "0 20px 60px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)",
  radius: 12, radiusSm: 8, radiusLg: 16, radiusXl: 22,
};

export const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// Reusable inline style fragments
export const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: `1px solid ${B.border}`,
  borderRadius: B.radiusSm,
  fontSize: 14,
  fontFamily: font,
  color: B.text,
  background: B.white,
  transition: 'border-color 0.2s, box-shadow 0.2s',
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
};

export const buttonSecondary = {
  padding: '10px 24px',
  background: B.white,
  color: B.text,
  border: `1px solid ${B.border}`,
  borderRadius: B.radiusSm,
  fontSize: 14,
  fontWeight: 500,
  fontFamily: font,
  cursor: 'pointer',
  transition: 'background 0.2s',
};
