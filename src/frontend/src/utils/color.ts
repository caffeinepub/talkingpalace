/**
 * Convert hex color to OKLCH components for CSS variables
 * Returns a string in the format "L C H" (e.g., "0.65 0.20 30")
 */
export function hexToOKLCH(hex: string): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Validate hex format
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    // Return default orange if invalid
    return '0.62 0.22 30';
  }

  // Convert hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  // Convert RGB to linear RGB
  const toLinear = (c: number) => {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);

  // Convert linear RGB to XYZ (D65 illuminant)
  const x = 0.4124564 * rLin + 0.3575761 * gLin + 0.1804375 * bLin;
  const y = 0.2126729 * rLin + 0.7151522 * gLin + 0.0721750 * bLin;
  const z = 0.0193339 * rLin + 0.1191920 * gLin + 0.9503041 * bLin;

  // Convert XYZ to OKLab
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // Convert OKLab to OKLCH
  const C = Math.sqrt(a * a + b_ * b_);
  let H = Math.atan2(b_, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  // Clamp and format values
  const clampedL = Math.max(0, Math.min(1, L));
  const clampedC = Math.max(0, Math.min(0.4, C)); // Limit chroma to reasonable range
  const clampedH = Math.round(H);

  return `${clampedL.toFixed(2)} ${clampedC.toFixed(2)} ${clampedH}`;
}
