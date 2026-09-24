import type { LegalPage, LegalContent } from '@/schemas/legalContentSchema';

export interface LegalArticleProps {
  content: LegalPage | LegalContent['changelog'];
  labels: LegalContent['labels'];
  /** 更新日志渲染 releases 时间线 */
  showReleases?: boolean;
}

export function LegalArticle({ content, labels, showReleases = false }: LegalArticleProps) {
  const releases = showReleases && 'releases' in content && content.releases ? content.releases : [];

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-10">
        <p className="text-sm text-primary font-medium mb-2">
          {labels.updatedAt}：{content.updatedAt}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-title mb-4">{content.title}</h1>
        <p className="text-base leading-relaxed text-soft">{content.intro}</p>
      </header>

      <nav aria-label={labels.toc} className="mb-10 rounded-xl border border-line bg-surface p-4">
        <p className="text-sm font-semibold text-title mb-2">{labels.toc}</p>
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted">
          {content.sections.map((section) => (
            <li key={section.heading}>
              <a href={`#${slugify(section.heading)}`} className="hover:text-primary transition-colors">
                {section.heading}
              </a>
            </li>
          ))}
          {releases.length > 0 && (
            <li>
              <a href="#releases" className="hover:text-primary transition-colors">
                {labels.releasesHeading}
              </a>
            </li>
          )}
        </ol>
      </nav>

      <div className="space-y-10">
        {content.sections.map((section) => (
          <section key={section.heading} id={slugify(section.heading)} className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-title mb-3">{section.heading}</h2>
            <div className="space-y-3 text-base leading-relaxed text-soft">
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {'items' in section && Array.isArray(section.items) && section.items.length > 0 && (
                <ul className="list-disc list-inside space-y-2 pl-1">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}

        {releases.length > 0 && (
          <section id="releases" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-title mb-6">{labels.releasesHeading}</h2>
            <ol className="space-y-6">
              {releases.map((release) => (
                <li
                  key={release.version}
                  className="relative rounded-xl border border-line bg-surface p-5"
                >
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      v{release.version}
                    </span>
                    <time className="text-sm text-muted" dateTime={release.date}>
                      {release.date}
                    </time>
                    {release.version.startsWith('1.') && (
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                        {labels.currentRelease}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-title mb-3">{release.title}</h3>
                  <ul className="list-disc list-inside space-y-1.5 text-sm leading-relaxed text-soft">
                    {release.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </article>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}
