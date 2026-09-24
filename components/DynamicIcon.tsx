import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { ICON_WHITELIST } from '@/lib/icons';

export interface DynamicIconProps extends LucideProps {
  name: string;
  /** 生产环境回退时的无障碍标签，来自 t(dict, 'icon.missing') */
  fallbackLabel?: string;
}

export function DynamicIcon({ name, fallbackLabel, ...props }: DynamicIconProps) {
  const registry = Icons as unknown as Record<string, React.ComponentType<LucideProps>>;
  const Component = registry[name];

  if (!Component || !ICON_WHITELIST.includes(name as (typeof ICON_WHITELIST)[number])) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        `[DynamicIcon] 图标 "${name}" 不在白名单中，请检查 config 或扩充 lib/icons.ts`,
      );
    }
    return <Icons.HelpCircle {...props} aria-label={fallbackLabel} role="img" />;
  }

  return <Component {...props} aria-hidden="true" />;
}
