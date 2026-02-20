'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/* ── Questions ── */
interface Q {
  id: string;
  q: string;
  sub?: string;
  type: 'text' | 'pick' | 'multi' | 'long';
  opts?: string[];
  ph?: string;
  chips?: string[];
}

const QS: Q[] = [
  { id: 'name', q: "What's your business called?", type: 'text', ph: 'e.g. Summit Electric' },
  { id: 'industry', q: 'What industry are you in?', type: 'pick', opts: ['Construction & Trades','Marketing & Agency','E-commerce & Retail','Professional Services','Healthcare','Real Estate','Technology & SaaS','Manufacturing','Food & Beverage','Education','Finance & Accounting','Logistics','Other'] },
  { id: 'size', q: 'How many people work in your business?', sub: 'Full-time, part-time, and contractors.', type: 'pick', opts: ['Just me','2–5','6–15','16–50','51–200','200+'] },
  { id: 'rev', q: 'Approximate annual revenue?', sub: 'Helps calculate your ROI. Stays private.', type: 'pick', opts: ['Under $100K','$100K–$500K','$500K–$1M','$1M–$5M','$5M–$20M','$20M+','Prefer not to say'] },
  { id: 'roles', q: 'What roles exist in your business?', sub: 'Select all that apply.', type: 'multi', opts: ['Admin / Office Manager','Bookkeeper / Accountant','Sales / BD','Customer Service','Marketing / Social Media','Project Manager','Operations','HR / Recruiting','Data Entry','Scheduling / Dispatch','Content Writer','Designer','IT Support','Warehouse / Inventory','Legal / Compliance'] },
  { id: 'bottleneck', q: "What's the biggest bottleneck right now?", sub: 'Be specific — the more detail, the better your report.', type: 'long', ph: 'What slows you down the most?', chips: ['Too much admin work','Slow customer response','Can\'t hire fast enough','Leads fall through cracks','Manual data entry','Inconsistent marketing'] },
  { id: 'repetitive', q: 'What tasks feel repetitive or mindless?', sub: 'These are the first things AI takes over.', type: 'long', ph: 'Tasks you wish were automated...', chips: ['Invoicing & billing','Scheduling meetings','Email sorting & replies','Report generation','Social media','Lead follow-up','Proposal writing'] },
  { id: 'payroll', q: 'Approximate monthly payroll?', sub: 'Foundation of your savings calculation.', type: 'pick', opts: ['Under $10K','$10K–$25K','$25K–$50K','$50K–$100K','$100K–$250K','$250K+','Not sure'] },
  { id: 'tech', q: 'How tech-savvy is your team?', type: 'pick', opts: ['Still use paper for some things','Basic — email and spreadsheets','Moderate — several SaaS tools','Advanced — some automations','Very advanced — developers on staff'] },
  { id: 'ai_exp', q: 'Have you used AI tools before?', type: 'pick', opts: ['No — don\'t know where to start','Played with ChatGPT','Tried but couldn\'t stick','Using some regularly','Deeply integrated'] },
  { id: 'time', q: 'If you got 10 hours back per week, what would you do?', type: 'long', ph: 'What matters most to you...', chips: ['Grow revenue','Strategic planning','Time with family','Work I actually enjoy','Take a real vacation'] },
  { id: 'tools', q: 'What software do you currently use?', sub: 'We\'ll find AI alternatives.', type: 'long', ph: 'Your current tools...', chips: ['QuickBooks / Xero','Google Workspace','Microsoft 365','Slack / Teams','Salesforce / HubSpot','Spreadsheets'] },
  { id: 'budget', q: 'Monthly software budget?', type: 'pick', opts: ['Under $500','$500–$2K','$2K–$5K','$5K–$10K','$10K+','Whatever delivers ROI'] },
  { id: 'speed', q: 'How fast do you want to move?', type: 'pick', opts: ['Yesterday','Within 30 days','Within 90 days','Just exploring'] },
  { id: 'email', q: 'Where should we send your report?', sub: 'Your custom AI implementation report — delivered in minutes.', type: 'text', ph: 'your@email.com' },
];

/* ── Styles ── */
const s = {
  page: 'min-h-screen flex flex-col items-center justify-center px-5 sm:px-8',
  card: 'w-full max-w-[560px]',
  h1: 'font-display text-[clamp(36px,6vw,60px)] font-semibold leading-[1.06] tracking-[-0.03em] text-[#111]',
  h2: 'font-display text-[clamp(24px,4vw,36px)] font-semibold leading-[1.15] tracking-[-0.025em] text-[#111] mb-2',
  sub: 'text-[15px] text-[#888] leading-[1.6] mb-8',
  body: 'text-[16px] text-[#555] leading-[1.7] max-w-md',
  inputBase: 'w-full bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] px-5 py-[18px] text-[16px] text-[#111] placeholder-[#bbb] outline-none transition-[border-color,box-shadow] duration-200 ease-out focus:border-[rgba(0,0,0,0.3)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]',
  textarea: 'w-full bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] px-5 py-4 text-[16px] text-[#111] placeholder-[#bbb] outline-none resize-none transition-[border-color,box-shadow] duration-200 ease-out focus:border-[rgba(0,0,0,0.3)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]',
  btn: 'inline-flex items-center justify-center gap-2 px-7 py-[14px] bg-[#111] text-white rounded-full text-[15px] font-medium transition-[transform,background,box-shadow] duration-200 hover:bg-[#333] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]',
  btnSm: 'px-5 py-3 bg-[#111] text-white rounded-[12px] text-[15px] font-medium transition-[transform,background,box-shadow] duration-200 hover:bg-[#333] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]',
  opt: 'w-full text-left px-5 py-[16px] bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] text-[15px] text-[#333] transition-[transform,border-color,background,box-shadow] duration-200 hover:border-[rgba(0,0,0,0.2)] hover:bg-[#FAFAFA] hover:shadow-[var(--shadow-sm)] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]',
  chip: 'px-4 py-[10px] rounded-[12px] text-[13px] font-medium border transition-[transform,border-color,background,color,box-shadow] duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]',
  chipOff: 'border-[rgba(0,0,0,0.08)] text-[#777] bg-white hover:border-[rgba(0,0,0,0.18)] hover:text-[#444] hover:shadow-[var(--shadow-sm)]',
  chipOn: 'border-[#111] bg-[#111] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]',
  progress: 'fixed top-0 left-0 right-0 z-50 h-[3px] bg-[rgba(0,0,0,0.04)]',
  progressBar: 'h-full bg-[#111] rounded-r-full transition-[width] duration-700 ease-out',
  nav: 'fixed top-[3px] left-0 right-0 z-40 flex items-center justify-between px-5 sm:px-8 h-14',
  hint: 'text-[12px] text-[#ccc] mt-4 select-none',
};

export default function Home() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [val, setVal] = useState('');
  const [multi, setMulti] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const q = QS[step];
  const pct = (step / QS.length) * 100;

  useEffect(() => { if (started && ref.current) setTimeout(() => ref.current?.focus(), 120); }, [step, started]);

  const next = useCallback((v: string | string[]) => {
    setAnswers(p => ({ ...p, [q.id]: v }));
    setVal('');
    setMulti([]);
    if (step + 1 >= QS.length) setDone(true);
    else setStep(s => s + 1);
  }, [q, step]);

  const key = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (val.trim()) next(val.trim()); } };
  const addChip = (c: string) => setVal(p => p.includes(c) ? p : (p ? `${p}, ${c}` : c));
  const toggleMulti = (o: string) => setMulti(p => p.includes(o) ? p.filter(x => x !== o) : [...p, o]);

  /* ── Landing ── */
  if (!started) return (
    <div className={s.page} style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,0,0,0.02), transparent)' }}>
      <div className={`${s.card} text-center animate-enter`}>
        <div className="inline-flex items-center gap-2.5 mb-12 animate-fade delay-75">
          <div className="w-9 h-9 bg-[#111] rounded-[10px] flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)' }}>
            <span className="text-white text-[14px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>A</span>
          </div>
          <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#111]">axiom</span>
        </div>

        <h1 className={`${s.h1} mb-5 animate-enter delay-75`}>
          Discover what AI<br/>can do for your business
        </h1>

        <p className={`${s.body} mx-auto mb-10 animate-enter delay-150`}>
          Answer a few questions about how your business runs. Get a custom report showing exactly which roles AI can replace, how much you&apos;ll save, and step-by-step implementation instructions.
        </p>

        <div className="animate-enter delay-300">
          <button onClick={() => setStarted(true)} className={s.btn}>
            Start your analysis
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <p className="text-[13px] text-[#bbb] mt-5">Free · Takes 5 minutes · No credit card</p>
        </div>
      </div>
    </div>
  );

  /* ── Complete ── */
  if (done) return (
    <div className={s.page}>
      <div className={`${s.card} text-center animate-enter`}>
        <div className="w-16 h-16 bg-[#111] rounded-[18px] flex items-center justify-center mx-auto mb-7" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 className="font-display text-[32px] font-semibold tracking-[-0.025em] text-[#111] mb-3">
          Your report is being generated
        </h2>
        <p className={`${s.body} mx-auto mb-8`}>
          Analyzing your business against 500+ AI tools and implementation patterns. Your report will arrive at{' '}
          <strong className="text-[#111] font-medium">{answers.email as string}</strong> within minutes.
        </p>
        <div className="h-[3px] bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden max-w-[280px] mx-auto relative">
          <div className="absolute inset-0 bg-[#111] rounded-full" style={{ animation: 'shimmer 1.8s ease-in-out infinite' }} />
        </div>
      </div>
    </div>
  );

  /* ── Question Flow ── */
  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress */}
      <div className={s.progress}>
        <div className={s.progressBar} style={{ width: `${pct}%` }} />
      </div>

      {/* Nav */}
      <nav className={s.nav}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#111] rounded-[6px] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold" style={{ fontFamily: 'var(--font-display)' }}>A</span>
          </div>
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#111]">axiom</span>
        </div>
        <span className="text-[13px] text-[#bbb] tabular-nums font-medium">{step + 1} / {QS.length}</span>
      </nav>

      {/* Question */}
      <main className="flex-1 flex items-center justify-center px-5 sm:px-8 pt-16 pb-24">
        <div className={`${s.card} animate-enter`} key={step}>
          <h2 className={s.h2}>{q.q}</h2>
          {q.sub ? <p className={s.sub}>{q.sub}</p> : <div className="mb-8" />}

          {/* Pick */}
          {q.type === 'pick' && q.opts && (
            <div className="flex flex-col gap-[10px]">
              {q.opts.map(o => (
                <button key={o} onClick={() => next(o)} className={s.opt}>{o}</button>
              ))}
            </div>
          )}

          {/* Multi */}
          {q.type === 'multi' && q.opts && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-[10px]">
                {q.opts.map(o => (
                  <button key={o} onClick={() => toggleMulti(o)} className={`${s.chip} ${multi.includes(o) ? s.chipOn : s.chipOff}`}>{o}</button>
                ))}
              </div>
              {multi.length > 0 && (
                <button onClick={() => next(multi)} className={s.btnSm}>
                  Continue with {multi.length} selected
                </button>
              )}
            </div>
          )}

          {/* Text */}
          {q.type === 'text' && (
            <>
              <div className="relative">
                <input
                  ref={ref as React.RefObject<HTMLInputElement>}
                  type={q.id === 'email' ? 'email' : 'text'}
                  value={val}
                  onChange={e => setVal(e.target.value)}
                  onKeyDown={key}
                  placeholder={q.ph}
                  autoComplete={q.id === 'email' ? 'email' : 'off'}
                  className={s.inputBase}
                />
              </div>
              {val.trim() && (
                <div className="mt-4">
                  <button onClick={() => next(val.trim())} className={s.btnSm}>
                    {q.id === 'email' ? 'Get my report →' : 'Continue →'}
                  </button>
                </div>
              )}
              <p className={s.hint}>Press Enter ↵</p>
            </>
          )}

          {/* Long text */}
          {q.type === 'long' && (
            <div className="space-y-4">
              {q.chips && (
                <div className="flex flex-wrap gap-[8px]">
                  {q.chips.map(c => (
                    <button key={c} onClick={() => addChip(c)} className={`${s.chip} ${val.includes(c) ? s.chipOn : s.chipOff}`}>{c}</button>
                  ))}
                </div>
              )}
              <textarea
                ref={ref as React.RefObject<HTMLTextAreaElement>}
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={key}
                placeholder={q.ph}
                rows={3}
                className={s.textarea}
              />
              {val.trim() && (
                <button onClick={() => next(val.trim())} className={s.btnSm}>Continue →</button>
              )}
              <p className={s.hint}>Press Enter ↵</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
