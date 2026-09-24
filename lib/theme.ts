import type { ThemeConfig } from '@/types/siteConfig';
import { hexToRgbTriplet } from './color';
import { paletteToCssVars } from './palette';

const RADIUS_MAP: Record<ThemeConfig['radius'], string> = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
};

const FONT_MAP: Record<ThemeConfig['font'], string> = {
  sans: 'var(--font-latin), system-ui, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

export function themeToCssVars(theme: ThemeConfig): Record<string, string> {
  return {
    '--color-primary': hexToRgbTriplet(theme.primary),
    '--color-secondary': hexToRgbTriplet(theme.secondary ?? theme.primary),
    ...paletteToCssVars(theme.primary),
    '--radius-card': RADIUS_MAP[theme.radius],
    '--font-sans': FONT_MAP[theme.font],
  };
}
