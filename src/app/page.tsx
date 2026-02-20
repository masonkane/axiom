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
  { id: 'bottleneck', q: 'Where are you losing the most time?', sub: 'Be specific. The more detail, the sharper your report.', type: 'long', ph: 'What slows your business down the most?', chips: ['Too much admin','Slow customer response','Hiring bottleneck','Leads fall through cracks','Manual data entry','Inconsistent marketing'] },
  { id: 'repetitive', q: 'What tasks feel like groundhog day?', sub: 'These are the first things AI eliminates.', type: 'long', ph: 'Tasks you do every week that feel mindless...', chips: ['Invoicing & billing','Scheduling meetings','Email sorting & replies','Report generation','Social media posting','Lead follow-up','Proposal writing'] },
  { id: 'payroll', q: 'Monthly payroll spend?', sub: 'Foundation of your savings calculation.', type: 'pick', opts: ['Under $10K','$10K–$25K','$25K–$50K','$50K–$100K','$100K–$250K','$250K+','Not sure'] },
  { id: 'tech', q: 'How tech-savvy is your team?', type: 'pick', opts: ['Still use paper for some things','Basic — email and spreadsheets','Moderate — a few SaaS tools','Advanced — automations in place','Very advanced — developers on staff'] },
  { id: 'ai_exp', q: 'Where are you with AI right now?', type: 'pick', opts: ['Haven\'t touched it','Played with ChatGPT a few times','Tried but nothing stuck','Using it regularly for some tasks','Deeply integrated into operations'] },
  { id: 'time', q: 'If you got 10 hours back this week, what would you do?', type: 'long', ph: 'What would that time mean for you?', chips: ['Grow revenue','Strategic planning','Family time','Work I actually enjoy','Finally take a vacation'] },
  { id: 'tools', q: 'What software do you use today?', sub: 'We\'ll find AI-powered alternatives and integrations.', type: 'long', ph: 'List your current tools...', chips: ['QuickBooks / Xero','Google Workspace','Microsoft 365','Slack / Teams','Salesforce / HubSpot','Spreadsheets for everything'] },
  { id: 'budget', q: 'Monthly software budget?', type: 'pick', opts: ['Under $500','$500–$2K','$2K–$5K','$5K–$10K','$10K+','Whatever delivers ROI'] },
  { id: 'speed', q: 'How fast do you want to move?', type: 'pick', opts: ['Yesterday','Within 30 days','Within 90 days','Just exploring for now'] },
  { id: 'email', q: 'Where should we send your report?', sub: 'Your custom AI implementation report — delivered in minutes.', type: 'text', ph: 'your@email.com' },
];

export default function Home() {
  const [step, setStep] = useState(-1); // -1 = landing
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [val, setVal] = useState('');
  const [multi, setMulti] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const landingInputRef = useRef<HTMLInputElement>(null);

  const q = step >= 0 ? QS[step] : null;
  const pct = step >= 0 ? ((step + 1) / QS.length) * 100 : 0;

  // Focus management
  useEffect(() => {
    if (step >= 0 && inputRef.current) setTimeout(() => inputRef.current?.focus(), 150);
  }, [step]);

  useEffect(() => {
    if (step === -1 && landingInputRef.current) setTimeout(() => landingInputRef.current?.focus(), 600);
  }, [step]);

  // Restore answers when going back
  useEffect(() => {
    if (step < 0 || done || !q) return;
    const prev = answers[q.id];
    if (q.type === 'multi' && Array.isArray(prev)) setMulti(prev);
    else if (typeof prev === 'string') setVal(prev);
  }, [step, done, q, answers]);

  const next = useCallback((v: string | string[]) => {
    if (!q && step === -1) {
      // Landing → first real question, save business name
      setAnswers(p => ({ ...p, name: v }));
      setVal('');
      setStep(1); // Skip Q0 (name) since we already have it
      return;
    }
    if (!q) return;
    setAnswers(p => ({ ...p, [q.id]: v }));
    setVal('');
    setMulti([]);
    if (step + 1 >= QS.length) setDone(true);
    else setStep(s => s + 1);
  }, [q, step]);

  const back = useCallback(() => {
    if (step <= 0) { setStep(-1); setVal(''); setMulti([]); return; }
    // Skip back to 0 if step is 1 (since 0=name is on landing)
    if (step === 1) { setStep(-1); setVal(''); setMulti([]); return; }
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

  /* ═══════════════ LANDING ═══════════════ */
  if (step === -1 && !done) return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-5 animate-fade">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[var(--fg)] rounded-lg flex items-center justify-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <span className="text-white text-[12px] font-bold font-display">A</span>
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.01em]">axiom</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 pb-20">
        <div className="w-full max-w-[600px]">
          {/* Headline */}
          <h1 className="font-display text-[clamp(32px,6vw,52px)] font-700 leading-[1.1] tracking-[-0.03em] text-center mb-4 animate-enter delay-100">
            What can AI do for your business?
          </h1>

          <p className="text-[16px] text-[var(--fg-secondary)] text-center leading-[1.6] mb-10 max-w-[440px] mx-auto animate-enter delay-200">
            Tell us about your business. Get a custom report with your AI savings, role-by-role analysis, and implementation plan.
          </p>

          {/* Input card — starts the flow */}
          <div className="input-surface p-2 animate-enter delay-300">
            <div className="flex items-center gap-3">
              <input
                ref={landingInputRef}
                type="text"
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && val.trim()) next(val.trim());
                }}
                placeholder="Enter your business name to start..."
                className="flex-1 bg-transparent px-4 py-4 text-[16px] text-[var(--fg)] placeholder-[var(--fg-ghost)] outline-none"
              />
              <button
                onClick={() => { if (val.trim()) next(val.trim()); }}
                disabled={!val.trim()}
                className="flex-shrink-0 w-11 h-11 rounded-[14px] bg-[var(--fg)] text-white flex items-center justify-center transition-all duration-200 hover:bg-[var(--fg)]/90 disabled:opacity-30 disabled:cursor-default active:scale-95"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-center gap-6 mt-6 animate-fade delay-500">
            <span className="flex items-center gap-1.5 text-[13px] text-[var(--fg-tertiary)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              5 minutes
            </span>
            <span className="flex items-center gap-1.5 text-[13px] text-[var(--fg-tertiary)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Private & secure
            </span>
            <span className="flex items-center gap-1.5 text-[13px] text-[var(--fg-tertiary)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              100% free
            </span>
          </div>
        </div>
      </main>
    </div>
  );

  /* ═══════════════ COMPLETE ═══════════════ */
  if (done) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-[480px] text-center">
        <div className="relative w-16 h-16 mx-auto mb-8">
          <div className="absolute inset-0 rounded-2xl bg-[var(--fg)]" style={{ animation: 'scale-in 0.45s var(--ease-spring) forwards', boxShadow: 'var(--shadow-lg)' }}>
            <svg className="absolute inset-0 m-auto" width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" style={{ animation: 'check-draw 0.35s ease forwards 0.35s', strokeDashoffset: 24 }}/>
            </svg>
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-[var(--fg)]" style={{ animation: 'pulse-ring 0.8s ease-out forwards 0.2s', opacity: 0 }} />
        </div>

        <h2 className="font-display text-[28px] font-semibold tracking-[-0.02em] mb-3 animate-enter delay-200">
          Building your report
        </h2>
        <p className="text-[15px] text-[var(--fg-secondary)] leading-[1.7] mb-2 animate-enter delay-300">
          Analyzing your business against 500+ AI tools and implementation patterns.
        </p>
        <p className="text-[14px] text-[var(--fg-tertiary)] mb-10 animate-enter delay-400">
          Delivering to <strong className="text-[var(--fg)] font-medium">{answers.email as string}</strong>
        </p>

        <div className="h-[3px] bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden max-w-[280px] mx-auto animate-fade delay-500 relative">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-[var(--fg)] rounded-full" style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
        </div>

        <div className="mt-12 text-left space-y-3 animate-enter delay-500">
          <p className="text-[11px] font-semibold text-[var(--fg-tertiary)] uppercase tracking-[0.1em] mb-3">Included in your report</p>
          {['Role-by-role AI replacement analysis', 'Projected annual savings breakdown', 'Recommended tools + implementation steps', '90-day implementation timeline'].map((t, i) => (
            <div key={i} className="flex items-center gap-3 text-[14px] text-[var(--fg-secondary)]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 8.5l3 3 5-6" stroke="var(--fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ═══════════════ QUESTION FLOW ═══════════════ */
  if (!q) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-[rgba(0,0,0,0.05)]">
        <div className="h-full bg-[var(--fg)] rounded-r-full transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-[2px] left-0 right-0 z-40 flex items-center justify-between px-5 sm:px-8 h-14">
        <div className="flex items-center gap-3">
          <button
            onClick={back}
            className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-white hover:shadow-[var(--shadow-xs)] active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--fg)] rounded-md flex items-center justify-center">
              <span className="text-white text-[9px] font-bold font-display">A</span>
            </div>
            <span className="text-[13px] font-semibold tracking-[-0.01em]">axiom</span>
          </div>
        </div>
        <span className="text-[13px] text-[var(--fg-ghost)] tabular-nums">{step + 1} / {QS.length}</span>
      </nav>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-5 sm:px-8 pt-20 pb-24">
        <div className="w-full max-w-[540px]" key={step}>
          <h2 className="font-display text-[clamp(22px,4vw,32px)] font-semibold leading-[1.15] tracking-[-0.02em] mb-2 animate-enter">
            {q.q}
          </h2>
          {q.sub && <p className="text-[14px] text-[var(--fg-tertiary)] leading-[1.6] mb-7 animate-enter delay-50">{q.sub}</p>}
          {!q.sub && <div className="mb-7" />}

          {/* Pick */}
          {q.type === 'pick' && q.opts && (
            <div className="flex flex-col gap-2 animate-enter delay-100">
              {q.opts.map(o => (
                <button key={o} onClick={() => next(o)} className="opt-card w-full text-left px-5 py-[14px] text-[15px] text-[var(--fg-secondary)]">
                  {o}
                </button>
              ))}
            </div>
          )}

          {/* Multi */}
          {q.type === 'multi' && q.opts && (
            <div className="space-y-5 animate-enter delay-100">
              <div className="flex flex-wrap gap-2">
                {q.opts.map(o => (
                  <button
                    key={o}
                    onClick={() => toggleMulti(o)}
                    className={`px-4 py-[10px] rounded-xl text-[13px] font-medium border transition-all duration-200 active:scale-[0.97] ${
                      multi.includes(o)
                        ? 'border-[var(--fg)] bg-[var(--fg)] text-white'
                        : 'border-[var(--border)] text-[var(--fg-tertiary)] bg-white hover:border-[var(--border-strong)] hover:text-[var(--fg-secondary)]'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
              {multi.length > 0 && (
                <button onClick={() => next(multi)} className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--fg)] text-white rounded-xl text-[14px] font-medium transition-all duration-200 hover:shadow-[var(--shadow-md)] active:scale-[0.98]">
                  Continue with {multi.length} selected →
                </button>
              )}
            </div>
          )}

          {/* Text */}
          {q.type === 'text' && (
            <div className="animate-enter delay-100">
              <div className="input-surface p-2">
                <div className="flex items-center gap-3">
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type={q.id === 'email' ? 'email' : 'text'}
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={q.ph}
                    autoComplete={q.id === 'email' ? 'email' : 'off'}
                    className="flex-1 bg-transparent px-4 py-3 text-[16px] text-[var(--fg)] placeholder-[var(--fg-ghost)] outline-none"
                  />
                  {val.trim() && (
                    <button
                      onClick={() => next(val.trim())}
                      className="flex-shrink-0 w-10 h-10 rounded-[12px] bg-[var(--fg)] text-white flex items-center justify-center transition-all duration-200 active:scale-95"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[12px] text-[var(--fg-ghost)] mt-3 ml-1">Press Enter ↵</p>
            </div>
          )}

          {/* Long text */}
          {q.type === 'long' && (
            <div className="space-y-3 animate-enter delay-100">
              {q.chips && (
                <div className="flex flex-wrap gap-2">
                  {q.chips.map(c => (
                    <button
                      key={c}
                      onClick={() => addChip(c)}
                      className={`px-4 py-[10px] rounded-xl text-[13px] font-medium border transition-all duration-200 active:scale-[0.97] ${
                        val.includes(c)
                          ? 'border-[var(--fg)] bg-[var(--fg)] text-white'
                          : 'border-[var(--border)] text-[var(--fg-tertiary)] bg-white hover:border-[var(--border-strong)] hover:text-[var(--fg-secondary)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <div className="input-surface p-2">
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={val}
                  onChange={e => setVal(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={q.ph}
                  rows={3}
                  className="w-full bg-transparent px-4 py-3 text-[16px] text-[var(--fg)] placeholder-[var(--fg-ghost)] outline-none resize-none"
                />
                {val.trim() && (
                  <div className="flex justify-end px-2 pb-2">
                    <button
                      onClick={() => next(val.trim())}
                      className="w-10 h-10 rounded-[12px] bg-[var(--fg)] text-white flex items-center justify-center transition-all duration-200 active:scale-95"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[12px] text-[var(--fg-ghost)] ml-1">Press Enter ↵</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
