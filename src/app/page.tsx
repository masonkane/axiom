'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/* ── Question Flow ── */
interface Question {
  id: string;
  text: string;
  subtext?: string;
  type: 'text' | 'select' | 'multi-select' | 'number' | 'textarea';
  options?: string[];
  placeholder?: string;
  suggestions?: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 'business_name',
    text: "What's your business called?",
    subtext: "Let's start simple.",
    type: 'text',
    placeholder: "e.g. Summit Electric, Brightline Marketing",
  },
  {
    id: 'industry',
    text: 'What industry are you in?',
    type: 'select',
    options: [
      'Construction / Trades',
      'Marketing / Agency',
      'E-commerce / Retail',
      'Professional Services',
      'Healthcare',
      'Real Estate',
      'Technology / SaaS',
      'Manufacturing',
      'Food & Beverage',
      'Education',
      'Finance / Accounting',
      'Logistics / Transportation',
      'Other',
    ],
  },
  {
    id: 'employee_count',
    text: 'How many people work in your business?',
    subtext: "Include yourself, full-time, part-time, and contractors.",
    type: 'select',
    options: ['Just me', '2–5', '6–15', '16–50', '51–200', '200+'],
  },
  {
    id: 'revenue_range',
    text: "What's your approximate annual revenue?",
    subtext: "This helps us calculate your potential ROI. It stays private.",
    type: 'select',
    options: [
      'Under $100K',
      '$100K – $500K',
      '$500K – $1M',
      '$1M – $5M',
      '$5M – $20M',
      '$20M+',
      'Prefer not to say',
    ],
  },
  {
    id: 'roles',
    text: 'What roles exist in your business?',
    subtext: "Select all that apply. We'll analyze each one.",
    type: 'multi-select',
    options: [
      'Admin / Office Manager',
      'Bookkeeper / Accountant',
      'Sales / Business Development',
      'Customer Service / Support',
      'Marketing / Social Media',
      'Project Manager',
      'Operations Manager',
      'HR / Recruiting',
      'Data Entry / Filing',
      'Scheduling / Dispatch',
      'Content Writer / Copywriter',
      'Designer',
      'IT / Tech Support',
      'Warehouse / Inventory',
      'Legal / Compliance',
    ],
  },
  {
    id: 'biggest_bottleneck',
    text: 'What feels like the biggest bottleneck in your business right now?',
    subtext: "Be specific. The more detail, the better your report.",
    type: 'textarea',
    placeholder: "e.g. I spend 3 hours a day on email. Scheduling is chaos. We lose leads because nobody follows up fast enough.",
    suggestions: [
      "Too much time on admin work",
      "Can't hire fast enough",
      "Customer response time is too slow",
      "Data entry is eating us alive",
      "Marketing is inconsistent",
    ],
  },
  {
    id: 'repetitive_tasks',
    text: 'What tasks feel repetitive or mindless?',
    subtext: "These are usually the first things AI can take over.",
    type: 'textarea',
    placeholder: "e.g. Invoicing, data entry, scheduling meetings, writing proposals, sorting emails, social media posting",
    suggestions: [
      "Invoicing and billing",
      "Scheduling and calendar management",
      "Email sorting and responses",
      "Report generation",
      "Social media management",
      "Lead follow-up",
    ],
  },
  {
    id: 'monthly_payroll',
    text: "What's your approximate monthly payroll spend?",
    subtext: "This is the foundation of your ROI calculation.",
    type: 'select',
    options: [
      'Under $10K',
      '$10K – $25K',
      '$25K – $50K',
      '$50K – $100K',
      '$100K – $250K',
      '$250K+',
      "I don't know",
    ],
  },
  {
    id: 'tech_comfort',
    text: 'How comfortable is your team with technology?',
    type: 'select',
    options: [
      'We still use paper for some things',
      'Basic — email, spreadsheets, maybe some apps',
      'Moderate — we use several SaaS tools',
      'Advanced — we automate some workflows already',
      'Very advanced — we have developers on staff',
    ],
  },
  {
    id: 'ai_experience',
    text: 'Have you tried using AI tools in your business before?',
    type: 'select',
    options: [
      "No — don't know where to start",
      'Played with ChatGPT a bit',
      "Tried a few tools but couldn't make them stick",
      'Using some AI tools regularly',
      'We have AI deeply integrated already',
    ],
  },
  {
    id: 'time_waste',
    text: 'If you could get 10 hours back per week, what would you spend them on?',
    subtext: "This tells us what matters most to you.",
    type: 'textarea',
    placeholder: "e.g. Growing the business, spending time with family, actually doing the work I love instead of admin",
    suggestions: [
      "Growing revenue and sales",
      "Strategic planning",
      "Spending time with family",
      "Doing the work I actually enjoy",
      "Taking a real vacation",
    ],
  },
  {
    id: 'tools_currently',
    text: 'What software/tools do you currently use?',
    subtext: "List anything — we'll find AI alternatives and integrations.",
    type: 'textarea',
    placeholder: "e.g. QuickBooks, Google Workspace, Slack, Salesforce, Excel, Monday.com",
    suggestions: [
      "QuickBooks / Xero",
      "Google Workspace / Microsoft 365",
      "Slack / Teams",
      "Salesforce / HubSpot",
      "Spreadsheets for everything",
    ],
  },
  {
    id: 'budget',
    text: "What's your monthly budget for software and tools?",
    type: 'select',
    options: [
      'Under $500/month',
      '$500 – $2,000/month',
      '$2,000 – $5,000/month',
      '$5,000 – $10,000/month',
      '$10,000+/month',
      'Whatever delivers ROI',
    ],
  },
  {
    id: 'timeline',
    text: 'How quickly do you want to implement changes?',
    type: 'select',
    options: [
      'Yesterday',
      'Within 30 days',
      'Within 90 days',
      "I'm just exploring for now",
    ],
  },
  {
    id: 'email',
    text: "Last one. Where should we send your report?",
    subtext: "Your custom AI implementation report will be ready in minutes.",
    type: 'text',
    placeholder: 'your@email.com',
  },
];

/* ── Components ── */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="w-1.5 h-1.5 bg-white/40 rounded-full typing-dot" />
      <div className="w-1.5 h-1.5 bg-white/40 rounded-full typing-dot" />
      <div className="w-1.5 h-1.5 bg-white/40 rounded-full typing-dot" />
    </div>
  );
}

function MessageBubble({ type, children }: { type: 'system' | 'user'; children: React.ReactNode }) {
  return (
    <div className={`animate-fade-in ${type === 'user' ? 'flex justify-end' : ''}`}>
      <div className={`max-w-[480px] ${
        type === 'system'
          ? 'text-white/90'
          : 'bg-white/[0.06] border border-white/[0.08] rounded-2xl px-5 py-3 text-white/80'
      }`}>
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [messages, setMessages] = useState<{ type: 'system' | 'user'; content: React.ReactNode }[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showInput]);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput, currentStep]);

  const addSystemMessage = (content: React.ReactNode) => {
    return new Promise<void>((resolve) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { type: 'system', content }]);
        resolve();
      }, 600 + Math.random() * 400);
    });
  };

  const showQuestion = async (index: number) => {
    const q = QUESTIONS[index];
    await addSystemMessage(
      <div>
        <p className="text-[15px] font-medium leading-relaxed">{q.text}</p>
        {q.subtext && <p className="text-[13px] text-white/40 mt-1.5">{q.subtext}</p>}
      </div>
    );
    setShowInput(true);
  };

  const handleStart = async () => {
    setStarted(true);
    await addSystemMessage(
      <div>
        <p className="text-[15px] font-medium leading-relaxed">
          I'm going to ask you about your business — how it runs, where time gets wasted, what roles you have, and what's costing you the most.
        </p>
        <p className="text-[13px] text-white/40 mt-2">Takes about 5 minutes. Your answers stay private.</p>
      </div>
    );
    await showQuestion(0);
  };

  const handleAnswer = async (value: string | string[]) => {
    const q = QUESTIONS[currentStep];
    const displayValue = Array.isArray(value) ? value.join(', ') : value;

    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    setMessages((prev) => [...prev, { type: 'user', content: <p className="text-[15px]">{displayValue}</p> }]);
    setShowInput(false);
    setInputValue('');
    setSelectedOptions([]);

    const nextStep = currentStep + 1;
    if (nextStep >= QUESTIONS.length) {
      setIsComplete(true);
      await addSystemMessage(
        <div>
          <p className="text-[15px] font-medium leading-relaxed">Generating your custom AI implementation report...</p>
          <p className="text-[13px] text-white/40 mt-1.5">This typically takes 2-3 minutes. We're analyzing your specific business against our database of 500+ AI tools and implementation patterns.</p>
        </div>
      );
      // TODO: Generate report
      return;
    }

    setCurrentStep(nextStep);
    await showQuestion(nextStep);
  };

  const handleSubmit = () => {
    const q = QUESTIONS[currentStep];
    if (q.type === 'multi-select') {
      if (selectedOptions.length > 0) handleAnswer(selectedOptions);
    } else {
      if (inputValue.trim()) handleAnswer(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const currentQuestion = QUESTIONS[currentStep];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-14 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
        <span className="text-[15px] font-semibold tracking-tight">axiom</span>
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-white/30 hidden sm:block">AI Implementation Intelligence</span>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-14">
        {!started ? (
          /* Landing */
          <div className="flex flex-col items-center text-center max-w-xl animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-8">
              <span className="text-black text-lg font-bold">A</span>
            </div>
            <h1 className="text-[clamp(28px,5vw,48px)] font-semibold tracking-tight leading-[1.1] mb-4">
              Discover what AI<br />can do for your business.
            </h1>
            <p className="text-[15px] text-white/40 leading-relaxed max-w-md mb-10">
              Answer a few questions about how your business runs. Get a custom report showing exactly which roles AI can handle, how much you'll save, and step-by-step implementation instructions.
            </p>
            <button
              onClick={handleStart}
              className="group flex items-center gap-2 px-8 py-3.5 bg-white text-black rounded-full text-[15px] font-medium hover:bg-white/90 transition-all"
            >
              Start your analysis
              <ArrowUp className="w-4 h-4 rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <p className="text-[12px] text-white/20 mt-4">Free · 5 minutes · No credit card</p>
          </div>
        ) : (
          /* Chat */
          <div className="w-full max-w-2xl flex-1 flex flex-col py-8">
            <div className="flex-1 space-y-6 pb-32">
              {messages.map((msg, i) => (
                <MessageBubble key={i} type={msg.type}>
                  {msg.content}
                </MessageBubble>
              ))}
              {isTyping && <TypingIndicator />}

              {/* Input Area */}
              {showInput && !isComplete && (
                <div className="animate-fade-in space-y-3">
                  {currentQuestion.type === 'select' && currentQuestion.options && (
                    <div className="flex flex-wrap gap-2">
                      {currentQuestion.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          className="px-4 py-2.5 text-[14px] border border-white/[0.1] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.2] transition-all"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'multi-select' && currentQuestion.options && (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {currentQuestion.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSelectedOptions((prev) =>
                                prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
                              );
                            }}
                            className={`px-4 py-2.5 text-[14px] border rounded-xl transition-all ${
                              selectedOptions.includes(opt)
                                ? 'border-white/40 bg-white/[0.08] text-white'
                                : 'border-white/[0.1] text-white/50 hover:text-white/70 hover:border-white/[0.2]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {selectedOptions.length > 0 && (
                        <button
                          onClick={handleSubmit}
                          className="px-6 py-2.5 bg-white text-black rounded-xl text-[14px] font-medium hover:bg-white/90 transition-all"
                        >
                          Continue with {selectedOptions.length} selected →
                        </button>
                      )}
                    </>
                  )}

                  {(currentQuestion.type === 'text' || currentQuestion.type === 'number') && (
                    <div className="relative">
                      <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type={currentQuestion.type === 'number' ? 'number' : 'text'}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={currentQuestion.placeholder || 'Type your answer...'}
                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-2xl px-5 py-4 pr-14 text-[15px] text-white placeholder-white/20 outline-none focus:border-white/[0.25] transition-colors"
                      />
                      <button
                        onClick={handleSubmit}
                        disabled={!inputValue.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white flex items-center justify-center disabled:opacity-20 transition-opacity"
                      >
                        <ArrowUp className="w-4 h-4 text-black" />
                      </button>
                    </div>
                  )}

                  {currentQuestion.type === 'textarea' && (
                    <div className="space-y-3">
                      {currentQuestion.suggestions && (
                        <div className="flex flex-wrap gap-2">
                          {currentQuestion.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => setInputValue((prev) => prev ? `${prev}, ${s}` : s)}
                              className="px-3 py-1.5 text-[12px] border border-white/[0.08] rounded-lg text-white/40 hover:text-white/60 hover:border-white/[0.15] transition-all"
                            >
                              + {s}
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
                          placeholder={currentQuestion.placeholder || 'Type your answer...'}
                          rows={3}
                          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-2xl px-5 py-4 pr-14 text-[15px] text-white placeholder-white/20 outline-none focus:border-white/[0.25] transition-colors resize-none"
                        />
                        <button
                          onClick={handleSubmit}
                          disabled={!inputValue.trim()}
                          className="absolute right-3 bottom-3 w-8 h-8 rounded-lg bg-white flex items-center justify-center disabled:opacity-20 transition-opacity"
                        >
                          <ArrowUp className="w-4 h-4 text-black" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-center py-3 text-[11px] text-white/15 bg-gradient-to-t from-black via-black to-transparent pointer-events-none">
        axiom · ai implementation intelligence
      </footer>
    </div>
  );
}
