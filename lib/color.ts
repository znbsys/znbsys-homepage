/** 默认主题色，必须与 config/locales/*.json 的 theme.primary 保持一致 */
export const DEFAULT_PRIMARY = '#2563eb';

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** 是否为合法的 3/6 位十六进制颜色 */
export function isValidHex(hex: string): boolean {
  return HEX_RE.test(hex);
}

/** 归一化为 6 位小写 hex（3 位展开），便于比较与 <input type="color"> 回填 */
export function normalizeHex(hex: string): string {
  if (!isValidHex(hex)) return hex;
  const lower = hex.toLowerCase();
  if (lower.length === 4) {
    return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`;
  }
  return lower;
}

/** 是否等于默认主题色 */
export function isDefaultPrimary(hex: string): boolean {
  return isValidHex(hex) && normalizeHex(hex) === DEFAULT_PRIMARY;
}

/** "R G B" 三元组转 6 位小写 hex，如 "37 99 235" -> "#2563eb"；非法输入返回 null */
export function tripletToHex(triplet: string): string | null {
  const parts = triplet.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return `#${nums.map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * hex 颜色转为 CSS 自定义属性所需的 "R G B" 格式。
 * 支持 3 位与 6 位 hex，如 "#2563eb" -> "37 99 235"。
 */
export function hexToRgbTriplet(hex: string): string {
  const { r, g, b } = parseHex(hex);
  return `${r} ${g} ${b}`;
}

/** 解析 3/6 位 hex 为 RGB 分量（0–255） */
export function parseHex(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace(/^#/, '');

  let r: number;
  let g: number;
  let b: number;

  if (cleaned.length === 3) {
    r = parseInt(cleaned[0]! + cleaned[0], 16);
    g = parseInt(cleaned[1]! + cleaned[1], 16);
    b = parseInt(cleaned[2]! + cleaned[2], 16);
  } else if (cleaned.length === 6) {
    r = parseInt(cleaned.slice(0, 2), 16);
    g = parseInt(cleaned.slice(2, 4), 16);
    b = parseInt(cleaned.slice(4, 6), 16);
  } else {
    throw new Error(`[color] 无效的十六进制颜色: "${hex}"`);
  }

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    throw new Error(`[color] 无效的十六进制颜色: "${hex}"`);
  }

  return { r, g, b };
}

/** RGB -> HSL，h 为 0–360，s/l 为 0–1 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
  else if (max === gn) h = ((bn - rn) / d + 2) * 60;
  else h = ((rn - gn) / d + 4) * 60;

  return { h, s, l };
}

/** HSL -> 6 位小写 hex，s/l 为 0–1 */
export function hslToHex(h: number, s: number, l: number): string {
  const sn = Math.min(1, Math.max(0, s));
  const ln = Math.min(1, Math.max(0, l));
  const hn = ((h % 360) + 360) % 360;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;

  let rgb: [number, number, number];
  if (hn < 60) rgb = [c, x, 0];
  else if (hn < 120) rgb = [x, c, 0];
  else if (hn < 180) rgb = [0, c, x];
  else if (hn < 240) rgb = [0, x, c];
  else if (hn < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}
