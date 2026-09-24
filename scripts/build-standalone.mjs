#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const localesDir = resolve(root, 'config/locales');
const distDir = resolve(root, 'dist');

const locales = ['zh-CN', 'en', 'ja'];

function getLocaleDir(locale) {
  return locale === 'zh-CN' ? '' : locale;
}

for (const locale of locales) {
  const localePath = resolve(localesDir, `${locale}.json`);
  const raw = readFileSync(localePath, 'utf-8');
  const config = JSON.parse(raw);

  const targetDir = resolve(distDir, getLocaleDir(locale));
  mkdirSync(targetDir, { recursive: true });

  const html = `<!DOCTYPE html>
<html lang="${config.meta?.locale ?? locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.meta?.title ?? ''}</title>
  <meta name="description" content="${config.meta?.description ?? ''}" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '${config.theme?.primary ?? '#2563eb'}',
            secondary: '${config.theme?.secondary ?? '#7c3aed'}',
          }
        }
      }
    }
  <\/script>
</head>
<body class="min-h-screen bg-slate-950 text-slate-100 antialiased">
  <script>
    window.__SITE_DATA__ = ${JSON.stringify(config)};
  <\/script>

  <header id="navbar"></header>
  <section id="hero"></section>
  <section id="features"></section>
  <section id="about"></section>
  <section id="testimonials"></section>
  <section id="contact"></section>
  <footer id="footer"></footer>

  <script>
    const data = window.__SITE_DATA__;
    document.title = data.meta?.title ?? '';

    // Navbar
    const nav = document.getElementById('navbar');
    nav.innerHTML = \`
      <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center gap-2">
            \${data.brand?.logoSvg ? '<span class="w-8 h-8 text-blue-600">' + data.brand.logoSvg + '</span>' : ''}
            <span class="text-lg font-bold text-slate-900">\${data.brand?.name ?? ''}</span>
          </div>
          <div class="hidden md:flex items-center gap-1">
            \${(data.navbar?.links ?? []).map(l => '<a href="' + l.href + '" class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">' + l.label + '</a>').join('')}
            \${data.navbar?.ctaButton ? '<a href="' + data.navbar.ctaButton.href + '" class="ml-3 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500">' + data.navbar.ctaButton.text + '</a>' : ''}
          </div>
        </div>
      </nav>
    \`;

    // Hero
    const hero = document.getElementById('hero');
    hero.innerHTML = \`
      <section class="relative overflow-hidden bg-slate-900 pt-32 pb-20 text-white">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          \${data.hero?.badge ? '<span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-8">' + data.hero.badge + '</span>' : ''}
          <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">\${data.hero?.headline ?? ''}</h1>
          <p class="mt-6 text-xl text-slate-300 max-w-2xl mx-auto">\${data.hero?.subheadline ?? ''}</p>
          <div class="mt-10 flex justify-center gap-4">
            <a href="\${data.hero?.primaryCta?.href ?? '#'}" class="px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition shadow-lg shadow-blue-500/25">\${data.hero?.primaryCta?.text ?? ''}</a>
            \${data.hero?.secondaryCta ? '<a href="' + data.hero.secondaryCta.href + '" class="px-8 py-3.5 rounded-lg border border-slate-700 hover:bg-slate-800 font-semibold text-slate-200 transition">' + data.hero.secondaryCta.text + '</a>' : ''}
          </div>
        </div>
      </section>
    \`;

    // Features
    const feat = document.getElementById('features');
    feat.innerHTML = \`
      <section id="features" class="py-24 bg-slate-950 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold tracking-tight">\${data.features?.title ?? ''}</h2>
            <p class="mt-4 text-lg text-slate-400">\${data.features?.subtitle ?? ''}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            \${(data.features?.items ?? []).map(item => '<div class="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition"><h3 class="text-xl font-semibold mb-3">' + item.title + '</h3><p class="text-slate-400 leading-relaxed">' + item.description + '</p></div>').join('')}
          </div>
        </div>
      </section>
    \`;

    // About
    const about = document.getElementById('about');
    if (data.about) {
      about.innerHTML = \`
        <section id="about" class="py-24 bg-slate-900 text-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">\${data.about.title}</h2>
            <div class="mt-6 space-y-4">\${data.about.description.map(p => '<p class="text-lg text-slate-300">' + p + '</p>').join('')}</div>
            \${data.about.stats.length ? '<div class="mt-10 grid grid-cols-3 gap-8">' + data.about.stats.map(s => '<div><div class="text-3xl font-bold text-blue-600">' + s.value + (s.suffix || '') + '</div><div class="mt-1 text-sm text-slate-400">' + s.label + '</div></div>').join('') + '</div>' : ''}
          </div>
        </section>
      \`;
    } else {
      about.remove();
    }

    // Testimonials
    const test = document.getElementById('testimonials');
    if (data.testimonials) {
      test.innerHTML = \`
        <section id="testimonials" class="py-24 bg-slate-950 text-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-16">\${data.testimonials.title}</h2>
            <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
              \${data.testimonials.items.map(item => '<div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-8"><blockquote class="mb-6 text-slate-300">"' + item.quote + '"</blockquote><div class="font-semibold">' + item.author + '</div><div class="text-sm text-slate-400">' + item.role + ' · ' + item.company + '</div></div>').join('')}
            </div>
          </div>
        </section>
      \`;
    } else {
      test.remove();
    }

    // Contact
    const contact = document.getElementById('contact');
    contact.innerHTML = \`
      <section id="contact" class="py-24 bg-slate-900 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">\${data.contact?.title ?? ''}</h2>
          <div class="mt-8 space-y-4 max-w-lg mx-auto">
            <a href="mailto:\${data.contact?.email ?? ''}" class="block text-blue-400 hover:underline">\${data.contact?.email ?? ''}</a>
            \${data.contact?.phone ? '<a href="tel:' + data.contact.phone.replace(/\\s/g, '') + '" class="block text-slate-300">' + data.contact.phone + '</a>' : ''}
            \${data.contact?.address ? '<p class="text-slate-400">' + data.contact.address + '</p>' : ''}
          </div>
        </div>
      </section>
    \`;

    // Footer
    const footer = document.getElementById('footer');
    footer.innerHTML = \`
      <footer class="border-t border-slate-800 bg-slate-950 text-slate-400 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p class="text-sm">\${data.footer?.copyright ?? ''}</p>
        </div>
      </footer>
    \`;
  <\/script>
</body>
</html>`;

  writeFileSync(resolve(targetDir, 'index.html'), html, 'utf-8');
  console.log(`[build-standalone] ✓ dist/${getLocaleDir(locale) || 'index'}/index.html`);

  // Default locale also gets a copy at root
  if (locale === 'zh-CN') {
    writeFileSync(resolve(distDir, 'index.html'), html, 'utf-8');
    console.log('[build-standalone] ✓ dist/index.html');
  }
}

console.log('\n[build-standalone] Done.');
