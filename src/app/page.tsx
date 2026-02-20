'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/* ── Question definitions ── */
interface Question {
  id: string;
  text: string;
  subtext?: string;
  type: 'text' | 'select' | 'multi-select' | 'textarea';
  options?: string[];
  placeholder?: string;
  chips?: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 'business_name',
    text: "What's your business called?",
    type: 'text',
    placeholder: 'Business name',
  },
  {
    id: 'industry',
    text: 'What industry are you in?',
    type: 'select',
    options: [
      'Construction & Trades',
      'Marketing & Agency',
      'E-commerce & Retail',
      'Professional Services',
      'Healthcare',
      'Real Estate',
      'Technology & SaaS',
      'Manufacturing',
      'Food & Beverage',
      'Education',
      'Finance & Accounting',
      'Logistics & Transportation',
      'Other',
    ],
  },
  {
    id: 'employee_count',
    text: 'How many people work in your business?',
    subtext: 'Full-time, part-time, and contractors.',
    type: 'select',
    options: ['Just me', '2–5', '6–15', '16–50', '51–200', '200+'],
  },
  {
    id: 'revenue_range',
    text: 'Approximate annual revenue?',
    subtext: 'Helps us calculate your ROI. Stays completely private.',
    type: 'select',
    options: ['Under $100K', '$100K–$500K', '$500K–$1M', '$1M–$5M', '$5M–$20M', '$20M+', 'Prefer not to say'],
  },
  {
    id: 'roles',
    text: 'What roles exist in your business?',
    subtext: 'Select all that apply.',
    type: 'multi-select',
    options: [
      'Admin / Office Manager',
      'Bookkeeper / Accountant',
      'Sales / BD',
      'Customer Service',
      'Marketing / Social Media',
      'Project Manager',
      'Operations',
      'HR / Recruiting',
      'Data Entry',
      'Scheduling / Dispatch',
      'Content / Copywriter',
      'Designer',
      'IT / Tech Support',
      'Warehouse / Inventory',
      'Legal / Compliance',
    ],
  },
  {
    id: 'biggest_bottleneck',
    text: "What's the biggest bottleneck in your business?",
    subtext: 'The more specific, the better your report.',
    type: 'textarea',
    placeholder: 'Describe what slows you down the most...',
    chips: [
      'Too much admin work',
      'Slow customer response time',
      "Can't hire fast enough",
      'Leads fall through cracks',
      'Manual data entry',
      'Inconsistent marketing',
    ],
  },
  {
    id: 'repetitive_tasks',
    text: 'What tasks feel repetitive or mindless?',
    subtext: 'These are the first things AI takes over.',
    type: 'textarea',
    placeholder: 'List the tasks you wish you could automate...',
    chips: [
      'Invoicing & billing',
      'Scheduling meetings',
      'Email sorting & replies',
      'Report generation',
      'Social media posting',
      'Lead follow-up',
      'Proposal writing',
    ],
  },
  {
    id: 'monthly_payroll',
    text: 'Approximate monthly payroll?',
    subtext: 'Foundation of your savings calculation.',
    type: 'select',
    options: ['Under $10K', '$10K–$25K', '$25K–$50K', '$50K–$100K', '$100K–$250K', '$250K+', "Don't know"],
  },
  {
    id: 'tech_comfort',
    text: "How tech-savvy is your team?",
    type: 'select',
    options: [
      'We still use paper for some things',
      'Basic — email and spreadsheets',
      'Moderate — several SaaS tools',
      'Advanced — some automations already',
      'Very advanced — developers on staff',
    ],
  },
  {
    id: 'ai_experience',
    text: 'Have you used AI tools before?',
    type: 'select',
    options: [
      "No — don't know where to start",
      'Played with ChatGPT',
      "Tried tools but couldn't stick",
      'Using some AI regularly',
      'AI is deeply integrated',
    ],
  },
  {
    id: 'time_back',
    text: 'If you got 10 hours back per week, what would you do?',
    type: 'textarea',
    placeholder: 'What matters most to you...',
    chips: [
      'Grow revenue',
      'Strategic planning',
      'Time with family',
      'Work I actually enjoy',
      'Take a real vacation',
    ],
  },
  {
    id: 'current_tools',
    text: 'What tools do you currently use?',
    subtext: "We'll find AI alternatives and integrations.",
    type: 'textarea',
    placeholder: 'List your current software...',
    chips: [
      'QuickBooks / Xero',
      'Google Workspace',
      'Microsoft 365',
      'Slack / Teams',
      'Salesforce / HubSpot',
      'Spreadsheets for everything',
    ],
  },
  {
    id: 'budget',
    text: 'Monthly software budget?',
    type: 'select',
    options: ['Under $500', '$500–$2K', '$2K–$5K', '$5K–$10K', '$10K+', 'Whatever delivers ROI'],
  },
  {
    id: 'timeline',
    text: 'How fast do you want to move?',
    type: 'select',
    options: ['Yesterday', 'Within 30 days', 'Within 90 days', 'Just exploring'],
  },
  {
    id: 'email',
    text: 'Where should we send your report?',
    subtext: 'Your custom AI implementation report will be ready in minutes.',
    type: 'text',
    placeholder: 'your@email.com',
  },
];

/* ── Main Page ── */
export default function Home() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [inputValue, setInputValue] = useState('');
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const q = QUESTIONS[step];
  const total = QUESTIONS.length;
  const progress = ((step) / total) * 100;

  useEffect(() => {
    if (started && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step, started]);

  const next = useCallback((value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    setInputValue('');
    setSelectedMulti([]);
    if (step + 1 >= total) {
      setComplete(true);
    } else {
      setStep((s) => s + 1);
    }
  }, [q, step, total]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) next(inputValue.trim());
    }
  };

  const addChip = (chip: string) => {
    setInputValue((prev) => {
      if (prev.includes(chip)) return prev;
      return prev ? `${prev}, ${chip}` : chip;
    });
  };

  /* ── Landing ── */
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-lg text-center animate-in">
          <div className="inline-flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-[#0d0d0d] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-[#0d0d0d]">axiom</span>
          </div>

          <h1 className="text-[clamp(32px,5vw,56px)] font-semibold leading-[1.08] tracking-[-0.03em] text-[#0d0d0d] mb-5">
            Discover what AI<br />can do for your business
          </h1>

          <p className="text-[17px] leading-[1.6] text-[#666] max-w-md mx-auto mb-10">
            Answer a few questions. Get a custom report showing exactly which roles AI can handle, how much you&apos;ll save, and how to implement it — step by step.
          </p>

          <button
            onClick={() => setStarted(true)}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#0d0d0d] text-white rounded-full text-[15px] font-medium hover:bg-[#333] transition-colors"
          >
            Start your analysis
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <p className="text-[13px] text-[#bbb] mt-5">Free · 5 minutes · No credit card</p>
        </div>

        <footer className="absolute bottom-6 text-[11px] text-[#ccc]">
          axiom · ai implementation intelligence
        </footer>
      </div>
    );
  }

  /* ── Complete ── */
  if (complete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-md text-center animate-in">
          <div className="w-14 h-14 bg-[#0d0d0d] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 className="text-[28px] font-semibold tracking-tight text-[#0d0d0d] mb-3">
            Your report is being generated
          </h2>
          <p className="text-[16px] text-[#666] leading-relaxed mb-6">
            We&apos;re analyzing your business against 500+ AI tools and implementation patterns. Your custom report will be delivered to <strong className="text-[#0d0d0d]">{answers.email as string}</strong> within minutes.
          </p>
          <div className="h-1 bg-[#f0f0f0] rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-[#0d0d0d] rounded-full" style={{ width: '100%', animation: 'shimmer 2s linear infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #0d0d0d 25%, #333 50%, #0d0d0d 75%)' }} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Question Flow ── */
  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-[#f0f0f0]">
        <div
          className="h-full bg-[#0d0d0d] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 h-14 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#0d0d0d] rounded-md flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">A</span>
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-[#0d0d0d]">axiom</span>
        </div>
        <span className="text-[13px] text-[#bbb] tabular-nums">{step + 1} of {total}</span>
      </header>

      {/* Question */}
      <main className="flex-1 flex items-center justify-center px-6 pt-14 pb-20">
        <div className="w-full max-w-xl animate-in" key={step}>
          {/* Question text */}
          <h2 className="text-[clamp(22px,3.5vw,32px)] font-semibold leading-[1.2] tracking-[-0.02em] text-[#0d0d0d] mb-2">
            {q.text}
          </h2>
          {q.subtext && (
            <p className="text-[15px] text-[#999] mb-8">{q.subtext}</p>
          )}
          {!q.subtext && <div className="mb-8" />}

          {/* Select options */}
          {q.type === 'select' && q.options && (
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => next(opt)}
                  className="w-full text-left px-5 py-4 border border-[#ebebeb] rounded-xl text-[15px] text-[#333] hover:border-[#0d0d0d] hover:text-[#0d0d0d] hover:bg-[#fafafa] transition-all active:scale-[0.99]"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Multi-select */}
          {q.type === 'multi-select' && q.options && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const isSelected = selectedMulti.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => setSelectedMulti((prev) => isSelected ? prev.filter((o) => o !== opt) : [...prev, opt])}
                      className={`px-4 py-2.5 rounded-xl text-[14px] border transition-all ${
                        isSelected
                          ? 'border-[#0d0d0d] bg-[#0d0d0d] text-white'
                          : 'border-[#ebebeb] text-[#555] hover:border-[#999] hover:text-[#0d0d0d]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {selectedMulti.length > 0 && (
                <button
                  onClick={() => next(selectedMulti)}
                  className="px-6 py-3 bg-[#0d0d0d] text-white rounded-xl text-[15px] font-medium hover:bg-[#333] transition-colors"
                >
                  Continue with {selectedMulti.length} selected
                </button>
              )}
            </div>
          )}

          {/* Text input */}
          {q.type === 'text' && (
            <div className="relative">
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type={q.id === 'email' ? 'email' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={q.placeholder}
                autoComplete={q.id === 'email' ? 'email' : 'off'}
                className="w-full border-b-2 border-[#ebebeb] focus:border-[#0d0d0d] bg-transparent py-4 text-[20px] text-[#0d0d0d] placeholder-[#ccc] outline-none transition-colors"
              />
              {inputValue.trim() && (
                <button
                  onClick={() => next(inputValue.trim())}
                  className="absolute right-0 bottom-4 px-5 py-2 bg-[#0d0d0d] text-white rounded-lg text-[14px] font-medium hover:bg-[#333] transition-colors"
                >
                  {q.id === 'email' ? 'Get my report' : 'Continue'}
                </button>
              )}
            </div>
          )}

          {/* Textarea */}
          {q.type === 'textarea' && (
            <div className="space-y-4">
              {q.chips && (
                <div className="flex flex-wrap gap-2">
                  {q.chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => addChip(chip)}
                      className={`px-3.5 py-2 text-[13px] border rounded-lg transition-all ${
                        inputValue.includes(chip)
                          ? 'border-[#0d0d0d] bg-[#0d0d0d] text-white'
                          : 'border-[#e5e5e5] text-[#888] hover:border-[#999] hover:text-[#555]'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative">
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={q.placeholder}
                  rows={3}
                  className="w-full border border-[#ebebeb] focus:border-[#0d0d0d] rounded-xl px-5 py-4 text-[16px] text-[#0d0d0d] placeholder-[#ccc] outline-none transition-colors resize-none"
                />
              </div>
              {inputValue.trim() && (
                <button
                  onClick={() => next(inputValue.trim())}
                  className="px-6 py-3 bg-[#0d0d0d] text-white rounded-xl text-[15px] font-medium hover:bg-[#333] transition-colors"
                >
                  Continue
                </button>
              )}
            </div>
          )}

          {/* Keyboard hint */}
          {(q.type === 'text' || q.type === 'textarea') && (
            <p className="text-[12px] text-[#ccc] mt-4">Press Enter ↵ to continue</p>
          )}
        </div>
      </main>
    </div>
  );
}
