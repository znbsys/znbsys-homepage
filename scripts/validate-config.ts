#!/usr/bin/env tsx
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { SiteConfigSchema } from '../schemas/siteConfigSchema';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: tsx scripts/validate-config.ts <path-to-json> [...]');
  process.exit(1);
}

let hasError = false;

for (const pattern of args) {
  const dir = resolve(pattern.replace(/\*.*$/, ''));
  const globSuffix = pattern.replace(/^.*\//, '');

  if (!existsSync(dir)) {
    console.error(`[validate] Directory not found: ${dir}`);
    hasError = true;
    continue;
  }

  const files = readdirSync(dir)
    .filter((f) => {
      if (globSuffix === '*.json') return f.endsWith('.json');
      return f === globSuffix;
    })
    .map((f) => resolve(dir, f));

  if (files.length === 0) {
    console.warn(`[validate] No files matched in: ${dir}`);
    continue;
  }

  for (const fullPath of files) {
    try {
      const raw = JSON.parse(readFileSync(fullPath, 'utf-8'));
      const result = SiteConfigSchema.safeParse(raw);

      if (result.success) {
        console.log(`[validate] ✓ ${fullPath}`);
      } else {
        console.error(`[validate] ✗ ${fullPath}`);
        for (const issue of result.error.issues) {
          console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
        }
        hasError = true;
      }
    } catch (err) {
      console.error(`[validate] ✗ ${fullPath} — ${err}`);
      hasError = true;
    }
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log('\n[validate] All configs passed.');
}
