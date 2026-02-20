'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/* ── Types ── */
interface Q {
  id: string;
  q: string;
  sub?: string;
  type: 'text' | 'pick' | 'multi' | 'long';
  opts?: string[];
  ph?: string;
  chips?: string[];
}

/* ── Questions ── */
const QS: Q[] = [
  { id: 'name', q: "What's your business called?", type: 'text', ph: 'e.g. Summit Electric' },
  { id: 'industry', q: 'What industry are you in?', type: 'pick', opts: ['Construction & Trades','Marketing & Agency','E-commerce & Retail','Professional Services','Healthcare','Real Estate','Technology & SaaS','Manufacturing','Food & Beverage','Education','Finance & Accounting','Logistics & Supply Chain','Other'] },
  { id: 'size', q: 'How big is your team?', sub: 'Full-time, part-time, and contractors.', type: 'pick', opts: ['Just me','2–5','6–15','16–50','51–200','200+'] },
  { id: 'rev', q: 'Approximate annual revenue?', sub: 'This is how we calculate your ROI. Never shared.', type: 'pick', opts: ['Under $100K','$100K–$500K','$500K–$1M','$1M–$5M','$5M–$20M','$20M+','Prefer not to say'] },
  { id: 'roles', q: 'What roles exist in your business?', sub: 'Select all that apply — we\'ll analyze each one.', type: 'multi', opts: ['Admin / Office Manager','Bookkeeper / Accountant','Sales / BD','Customer Service','Marketing / Social Media','Project Manager','Operations','HR / Recruiting','Data Entry','Scheduling / Dispatch','Content Writer','Designer','IT Support','Warehouse / Inventory','Legal / Compliance'] },
  { id: 'bottleneck', q: 'Where are you losing the most time?', sub: 'Be specific. The more detail you give, the sharper your report.', type: 'long', ph: 'What slows your business down the most?', chips: ['Too much admin','Slow customer response','Hiring bottleneck','Leads fall through cracks','Manual data entry','Inconsistent marketing'] },
  { id: 'repetitive', q: 'What tasks feel like groundhog day?', sub: 'These are the first things AI eliminates.', type: 'long', ph: 'Tasks you do every week that feel mindless...', chips: ['Invoicing & billing','Scheduling meetings','Email sorting & replies','Report generation','Social media posting','Lead follow-up','Proposal writing'] },
  { id: 'payroll', q: 'Monthly payroll spend?', sub: 'This is the foundation of your savings calculation.', type: 'pick', opts: ['Under $10K','$10K–$25K','$25K–$50K','$50K–$100K','$100K–$250K','$250K+','Not sure'] },
  { id: 'tech', q: 'How tech-savvy is your team?', type: 'pick', opts: ['Still use paper for some things','Basic — email and spreadsheets','Moderate — a few SaaS tools','Advanced — automations in place','Very advanced — developers on staff'] },
  { id: 'ai_exp', q: 'Where are you with AI right now?', type: 'pick', opts: ['Haven\'t touched it','Played with ChatGPT a few times','Tried to use it but nothing stuck','Using it regularly for some tasks','Deeply integrated into operations'] },
  { id: 'time', q: 'If you got 10 hours back this week, what would you do?', type: 'long', ph: 'What would that time mean for you?', chips: ['Grow revenue','Strategic planning','Family time','Work I actually enjoy','Finally take a vacation'] },
  { id: 'tools', q: 'What software do you use today?', sub: 'We\'ll find AI-powered alternatives and integrations.', type: 'long', ph: 'List your current tools...', chips: ['QuickBooks / Xero','Google Workspace','Microsoft 365','Slack / Teams','Salesforce / HubSpot','Spreadsheets for everything'] },
  { id: 'budget', q: 'Monthly software budget?', type: 'pick', opts: ['Under $500','$500–$2K','$2K–$5K','$5K–$10K','$10K+','Whatever delivers ROI'] },
  { id: 'speed', q: 'How fast do you want to move?', type: 'pick', opts: ['Yesterday','Within 30 days','Within 90 days','Just exploring for now'] },
  { id: 'email', q: 'Where should we send your report?', sub: 'Your custom AI implementation report — delivered in minutes, not months.', type: 'text', ph: 'your@email.com' },
];

/* ── Stat display for landing ── */
function AnimatedStat({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <div className="animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="text-[clamp(28px,4vw,40px)] font-display font-semibold tracking-[-0.03em] text-[var(--fg)]">{value}</div>
      <div className="text-[13px] text-[var(--fg-tertiary)] mt-1 tracking-[0.01em]">{label}</div>
    </div>
  );
}

/* ── Logo ── */
function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 rounded-[7px]' : 'w-10 h-10 rounded-[11px]';
  const txt = size === 'sm' ? 'text-[11px]' : 'text-[15px]';
  const name = size === 'sm' ? 'text-[14px]' : 'text-[17px]';
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dim} bg-[var(--fg)] flex items-center justify-center`} style={{ boxShadow: 'var(--shadow-md)' }}>
        <span className={`text-white ${txt} font-bold font-display`}>A</span>
      </div>
      <span className={`${name} font-semibold tracking-[-0.02em] text-[var(--fg)]`}>axiom</span>
    </div>
  );
}

/* ── Back button ── */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-white hover:shadow-[var(--shadow-sm)] active:scale-95"
      aria-label="Go back"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [val, setVal] = useState('');
  const [multi, setMulti] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const q = QS[step];
  const pct = ((step + 1) / QS.length) * 100;

  useEffect(() => {
    if (started && ref.current) setTimeout(() => ref.current?.focus(), 150);
  }, [step, started]);

  // Restore previous answer when going back
  useEffect(() => {
    if (!started || done) return;
    const prev = answers[q.id];
    if (q.type === 'multi' && Array.isArray(prev)) {
      setMulti(prev);
    } else if (typeof prev === 'string') {
      setVal(prev);
    }
  }, [step, started, done, q, answers]);

  const next = useCallback((v: string | string[]) => {
    setDirection('forward');
    setAnswers(p => ({ ...p, [q.id]: v }));
    setVal('');
    setMulti([]);
    if (step + 1 >= QS.length) setDone(true);
    else setStep(s => s + 1);
  }, [q, step]);

  const back = useCallback(() => {
    if (step === 0) { setStarted(false); return; }
    setDirection('back');
    setVal('');
    setMulti([]);
    setStep(s => s - 1);
  }, [step]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (val.trim()) next(val.trim());
    }
  };

  const addChip = (c: string) => setVal(p => p.includes(c) ? p : (p ? `${p}, ${c}` : c));
  const toggleMulti = (o: string) => setMulti(p => p.includes(o) ? p.filter(x => x !== o) : [...p, o]);

  /* ── Landing ── */
  if (!started) return (
    <div className="noise-bg min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-6 animate-fade">
        <Logo />
        <button
          onClick={() => setStarted(true)}
          className="text-[13px] font-medium text-[var(--fg-secondary)] px-4 py-2 rounded-full border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-white hover:shadow-[var(--shadow-sm)]"
        >
          Get started
        </button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 -mt-8">
        <div className="max-w-[680px] text-center">
          {/* Eyebrow */}
          <div className="animate-fade delay-100 mb-8">
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--fg-tertiary)] px-4 py-2 rounded-full border border-[var(--border)] bg-white/60 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI implementation intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-[clamp(38px,7vw,68px)] font-semibold leading-[1.04] tracking-[-0.035em] text-[var(--fg)] mb-6 animate-enter delay-150">
            Know exactly where<br className="hidden sm:block" /> AI fits your business
          </h1>

          {/* Sub */}
          <p className="text-[clamp(16px,2vw,19px)] text-[var(--fg-secondary)] leading-[1.65] max-w-[520px] mx-auto mb-10 animate-enter delay-200">
            Answer 15 questions about how your business runs. Get a custom report showing which roles AI can handle, how much you&apos;ll save, and exactly how to implement it.
          </p>

          {/* CTA */}
          <div className="animate-enter delay-300">
            <button
              onClick={() => setStarted(true)}
              className="group inline-flex items-center gap-3 px-8 py-[16px] bg-[var(--fg)] text-white rounded-full text-[15px] font-medium transition-all duration-300 hover:shadow-[var(--shadow-lg)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Start your analysis
              <svg className="transition-transform duration-300 group-hover:translate-x-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <p className="text-[13px] text-[var(--fg-ghost)] mt-5 tracking-[0.005em]">Free · 5 minutes · No credit card required</p>
          </div>
        </div>
      </main>

      {/* Stats bar */}
      <div className="border-t border-[var(--border)] bg-white/40 backdrop-blur-sm">
        <div className="max-w-[680px] mx-auto px-6 sm:px-10 py-8 flex items-center justify-between gap-8">
          <AnimatedStat value="500+" label="AI tools analyzed" delay={400} />
          <div className="w-px h-10 bg-[var(--border)]" />
          <AnimatedStat value="$47K" label="Avg. annual savings" delay={500} />
          <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
          <div className="hidden sm:block">
            <AnimatedStat value="3 min" label="Report delivery" delay={600} />
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Complete ── */
  if (done) return (
    <div className="noise-bg min-h-screen flex flex-col items-center justify-center px-6 sm:px-8">
      <div className="max-w-[520px] text-center">
        {/* Animated check */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-[22px] bg-[var(--fg)]" style={{ animation: 'check-in 0.5s var(--ease-spring) forwards', boxShadow: 'var(--shadow-lg)' }}>
            <svg className="absolute inset-0 m-auto" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" style={{ animation: 'line-draw 0.4s ease forwards 0.3s', strokeDashoffset: 24 }}/>
            </svg>
          </div>
          <div className="absolute inset-0 rounded-[22px] border-2 border-[var(--fg)]" style={{ animation: 'pulse-ring 1s ease-out forwards 0.2s', opacity: 0 }} />
        </div>

        <h2 className="font-display text-[clamp(26px,5vw,36px)] font-semibold tracking-[-0.025em] text-[var(--fg)] mb-3 animate-enter delay-200">
          Building your report now
        </h2>
        <p className="text-[16px] text-[var(--fg-secondary)] leading-[1.7] mb-3 animate-enter delay-300">
          We&apos;re analyzing your business against 500+ AI tools and implementation patterns.
        </p>
        <p className="text-[15px] text-[var(--fg-tertiary)] mb-10 animate-enter delay-400">
          Report arriving at <strong className="text-[var(--fg)] font-medium">{answers.email as string}</strong>
        </p>

        {/* Live progress bar */}
        <div className="h-[3px] bg-[rgba(0,0,0,0.05)] rounded-full overflow-hidden max-w-[320px] mx-auto animate-fade delay-500">
          <div className="h-full bg-[var(--fg)] rounded-full progress-glow" style={{ width: '35%', animation: 'shimmer 2s ease-in-out infinite, expand 8s ease-out forwards' }} />
        </div>

        {/* What to expect */}
        <div className="mt-12 pt-8 border-t border-[var(--border)] text-left animate-enter delay-500">
          <p className="text-[12px] font-medium text-[var(--fg-tertiary)] uppercase tracking-[0.08em] mb-4">Your report includes</p>
          <div className="space-y-3">
            {['Role-by-role AI replacement analysis', 'Projected annual savings breakdown', 'Recommended tools with implementation steps', 'Custom 90-day implementation timeline'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-[14px] text-[var(--fg-secondary)]">
                <div className="w-5 h-5 rounded-full bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M4 8.5l3 3 5-6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Question Flow ── */
  const animClass = direction === 'forward' ? 'animate-enter' : 'animate-fade';

  return (
    <div className="noise-bg min-h-screen flex flex-col">
      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-[rgba(0,0,0,0.04)]">
        <div
          className="h-full bg-[var(--fg)] rounded-r-full transition-[width] duration-500 ease-out progress-glow"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Nav */}
      <nav className="fixed top-[3px] left-0 right-0 z-40 flex items-center justify-between px-5 sm:px-8 h-16 bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <BackButton onClick={back} />
          <Logo size="sm" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[var(--fg-ghost)] tabular-nums font-medium">{step + 1}<span className="text-[var(--fg-ghost)]/50"> / </span>{QS.length}</span>
        </div>
      </nav>

      {/* Question */}
      <main className="flex-1 flex items-center justify-center px-5 sm:px-8 pt-20 pb-28">
        <div className="w-full max-w-[560px]" key={step}>
          <div className={animClass}>
            <h2 className="font-display text-[clamp(24px,4.5vw,38px)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--fg)] mb-2">
              {q.q}
            </h2>
            {q.sub && <p className="text-[15px] text-[var(--fg-tertiary)] leading-[1.6] mb-8">{q.sub}</p>}
            {!q.sub && <div className="mb-8" />}
          </div>

          {/* Pick */}
          {q.type === 'pick' && q.opts && (
            <div className={`flex flex-col gap-[10px] ${animClass}`} style={{ animationDelay: '80ms' }}>
              {q.opts.map((o, i) => (
                <button
                  key={o}
                  onClick={() => next(o)}
                  className="option-card w-full text-left px-5 py-[15px] bg-white border border-[var(--border)] rounded-[14px] text-[15px] text-[var(--fg-secondary)] transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)] active:scale-[0.995] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  style={{ animationDelay: `${80 + i * 30}ms` }}
                >
                  {o}
                </button>
              ))}
            </div>
          )}

          {/* Multi */}
          {q.type === 'multi' && q.opts && (
            <div className={`space-y-5 ${animClass}`} style={{ animationDelay: '80ms' }}>
              <div className="flex flex-wrap gap-[10px]">
                {q.opts.map(o => (
                  <button
                    key={o}
                    onClick={() => toggleMulti(o)}
                    className={`px-4 py-[10px] rounded-[12px] text-[13px] font-medium border transition-all duration-200 active:scale-[0.97] ${
                      multi.includes(o)
                        ? 'border-[var(--fg)] bg-[var(--fg)] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]'
                        : 'border-[var(--border)] text-[var(--fg-tertiary)] bg-white hover:border-[var(--border-strong)] hover:text-[var(--fg-secondary)] hover:shadow-[var(--shadow-xs)]'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
              {multi.length > 0 && (
                <button
                  onClick={() => next(multi)}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--fg)] text-white rounded-[12px] text-[15px] font-medium transition-all duration-200 hover:shadow-[var(--shadow-md)] active:scale-[0.98]"
                >
                  Continue with {multi.length} selected
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
            </div>
          )}

          {/* Text */}
          {q.type === 'text' && (
            <div className={animClass} style={{ animationDelay: '80ms' }}>
              <input
                ref={ref as React.RefObject<HTMLInputElement>}
                type={q.id === 'email' ? 'email' : 'text'}
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={handleKey}
                placeholder={q.ph}
                autoComplete={q.id === 'email' ? 'email' : 'off'}
                className="w-full bg-white border border-[var(--border)] rounded-[14px] px-5 py-[18px] text-[16px] text-[var(--fg)] placeholder-[var(--fg-ghost)] outline-none transition-all duration-200 focus:border-[var(--border-strong)] focus:shadow-[0_0_0_4px_rgba(0,102,255,0.06)]"
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-[12px] text-[var(--fg-ghost)] select-none">Press Enter ↵</p>
                {val.trim() && (
                  <button
                    onClick={() => next(val.trim())}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--fg)] text-white rounded-[10px] text-[14px] font-medium transition-all duration-200 hover:shadow-[var(--shadow-md)] active:scale-[0.98]"
                  >
                    {q.id === 'email' ? 'Get my report' : 'Continue'}
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Long text */}
          {q.type === 'long' && (
            <div className={`space-y-4 ${animClass}`} style={{ animationDelay: '80ms' }}>
              {q.chips && (
                <div className="flex flex-wrap gap-[8px]">
                  {q.chips.map(c => (
                    <button
                      key={c}
                      onClick={() => addChip(c)}
                      className={`px-4 py-[10px] rounded-[12px] text-[13px] font-medium border transition-all duration-200 active:scale-[0.97] ${
                        val.includes(c)
                          ? 'border-[var(--fg)] bg-[var(--fg)] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]'
                          : 'border-[var(--border)] text-[var(--fg-tertiary)] bg-white hover:border-[var(--border-strong)] hover:text-[var(--fg-secondary)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <textarea
                ref={ref as React.RefObject<HTMLTextAreaElement>}
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={handleKey}
                placeholder={q.ph}
                rows={3}
                className="w-full bg-white border border-[var(--border)] rounded-[14px] px-5 py-4 text-[16px] text-[var(--fg)] placeholder-[var(--fg-ghost)] outline-none resize-none transition-all duration-200 focus:border-[var(--border-strong)] focus:shadow-[0_0_0_4px_rgba(0,102,255,0.06)]"
              />
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-[var(--fg-ghost)] select-none">Press Enter ↵</p>
                {val.trim() && (
                  <button
                    onClick={() => next(val.trim())}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--fg)] text-white rounded-[10px] text-[14px] font-medium transition-all duration-200 hover:shadow-[var(--shadow-md)] active:scale-[0.98]"
                  >
                    Continue
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Keyboard shortcut hint (desktop) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-4 text-[12px] text-[var(--fg-ghost)] animate-fade delay-500">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-white text-[11px] font-mono">↵</kbd>
          Continue
        </span>
      </div>
    </div>
  );
}
