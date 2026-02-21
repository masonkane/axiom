'use client';

import { useEffect, useState } from 'react';

/* Simple markdown-to-HTML (handles headers, bold, lists, tables) */
function renderMarkdown(md: string): string {
  return md
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-[18px] font-semibold mt-8 mb-3 tracking-[-0.01em]">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-display text-[22px] font-semibold mt-10 mb-4 tracking-[-0.02em] pb-2 border-b border-[var(--border)]">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-display text-[28px] font-semibold mt-6 mb-4 tracking-[-0.02em]">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--fg)]">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Bullet lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 pl-2 py-0.5 text-[15px] leading-[1.7] text-[var(--fg-secondary)] list-disc">$1</li>')
    // Table rows (basic)
    .replace(/^\|(.+)\|$/gm, (_, row: string) => {
      const cells = row.split('|').map((c: string) => c.trim()).filter(Boolean);
      const tds = cells.map((c: string) => `<td class="px-4 py-2 text-[14px] border-b border-[var(--border)]">${c}</td>`).join('');
      return `<tr>${tds}</tr>`;
    })
    // Separator rows
    .replace(/<tr><td[^>]*>[-:]+<\/td>.*?<\/tr>/g, '')
    // Paragraphs (lines that aren't already HTML)
    .replace(/^(?!<[hluotr])((?!^\s*$).+)$/gm, '<p class="text-[15px] leading-[1.75] text-[var(--fg-secondary)] mb-3">$1</p>')
    // Wrap adjacent <li> in <ul>
    .replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="mb-4 space-y-0.5">$1</ul>')
    // Wrap adjacent <tr> in <table>
    .replace(/((?:<tr>.*<\/tr>\n?)+)/g, '<div class="overflow-x-auto mb-6"><table class="w-full border-collapse bg-white rounded-xl border border-[var(--border)] overflow-hidden">$1</table></div>');
}

export default function ReportPage() {
  const [report, setReport] = useState<string | null>(null);
  const [business, setBusiness] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get answers from sessionStorage (set by questionnaire on completion)
    const stored = sessionStorage.getItem('groundwork_answers');
    if (!stored) {
      setError('No questionnaire data found. Please complete the questionnaire first.');
      setLoading(false);
      return;
    }

    const answers = JSON.parse(stored);
    setBusiness(answers.name || 'Your Business');

    fetch('/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setReport(data.report);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-[480px] text-center">
        <div className="w-12 h-12 bg-[var(--fg)] rounded-xl flex items-center justify-center mx-auto mb-6" style={{ boxShadow: 'var(--shadow-md)' }}>
          <span className="text-white text-[14px] font-bold font-display">A</span>
        </div>
        <h2 className="font-display text-[24px] font-semibold tracking-[-0.02em] mb-2">
          Generating your report
        </h2>
        <p className="text-[15px] text-[var(--fg-secondary)] mb-8">
          Analyzing {business || 'your business'} against 500+ AI tools...
        </p>
        <div className="h-[3px] bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden max-w-[280px] mx-auto relative">
          <div className="absolute inset-y-0 left-0 w-full bg-[var(--fg)] rounded-full opacity-20" style={{ animation: 'shimmer 1.5s ease-in-out infinite' }} />
        </div>
        <p className="text-[13px] text-[var(--fg-tertiary)] mt-4">This usually takes 30-60 seconds</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-[480px] text-center">
        <p className="text-[15px] text-[var(--fg-secondary)] mb-6">{error}</p>
        <a href="/" className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--fg)] text-white rounded-xl text-[14px] font-medium">
          Start over →
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 sm:px-10 py-4 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[var(--fg)] rounded-lg flex items-center justify-center">
            <span className="text-white text-[12px] font-bold font-display">A</span>
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.01em]">groundwork</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="text-[13px] font-medium text-[var(--fg-secondary)] px-4 py-2 rounded-full border border-[var(--border)] hover:bg-white hover:shadow-[var(--shadow-xs)] transition-all"
          >
            Export PDF
          </button>
        </div>
      </nav>

      {/* Report header */}
      <div className="max-w-[720px] mx-auto px-6 sm:px-10 pt-12 pb-4">
        <p className="text-[11px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-[0.1em] mb-3">AI Implementation Report</p>
        <h1 className="font-display text-[clamp(28px,5vw,40px)] font-semibold tracking-[-0.03em] mb-2">{business}</h1>
        <p className="text-[14px] text-[var(--fg-tertiary)]">Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Report content */}
      <article
        className="max-w-[720px] mx-auto px-6 sm:px-10 pb-20"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(report || '') }}
      />

      {/* CTA */}
      <div className="max-w-[720px] mx-auto px-6 sm:px-10 pb-20">
        <div className="bg-white border border-[var(--border)] rounded-2xl p-8 text-center">
          <h3 className="font-display text-[20px] font-semibold tracking-[-0.01em] mb-2">Ready to implement?</h3>
          <p className="text-[15px] text-[var(--fg-secondary)] mb-6 max-w-[400px] mx-auto">
            Get a detailed implementation plan with hands-on support from our AI consultants.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="mailto:josh@groundwork.ai?subject=Implementation%20Plan%20-%20${encodeURIComponent(business)}" className="px-6 py-3 bg-[var(--fg)] text-white rounded-xl text-[14px] font-medium hover:shadow-[var(--shadow-md)] transition-all">
              Get implementation plan — $299
            </a>
            <a href="mailto:josh@groundwork.ai?subject=Managed%20Implementation%20-%20${encodeURIComponent(business)}" className="px-6 py-3 border border-[var(--border)] rounded-xl text-[14px] font-medium text-[var(--fg-secondary)] hover:bg-white hover:shadow-[var(--shadow-xs)] transition-all">
              Managed service — $4,999/mo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
