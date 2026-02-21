# Groundwork — Business Overview & AI Context Document

## What Groundwork Is

Groundwork is an AI implementation intelligence platform. A business owner answers a 15-question conversational questionnaire about their company, and Groundwork generates a custom AI implementation report — role-by-role analysis of what AI can replace, exact dollar savings, specific tool recommendations, and a 90-day implementation timeline. Delivered in minutes, not months.

**One-liner:** "Like McKinsey, but $299 and delivered in minutes."

## The Problem

There's a massive gap in AI consulting:
- **Bottom:** Free blog posts, YouTube videos, generic "use ChatGPT" advice — no specificity
- **Top:** McKinsey/Accenture-style consulting — $200K+, takes months, only Fortune 500 can afford it
- **Middle (Groundwork):** Custom, specific, actionable AI implementation reports for SMBs at $299 — nobody is here

Business owners know AI matters but don't know *where it fits their specific business*, *how much they'd actually save*, or *what to implement first*. Groundwork answers all three in one report.

## Revenue Model

| Tier | Price | What They Get |
|------|-------|---------------|
| Free | $0 | Executive summary (hook — shows savings potential, teases full report) |
| Full Report | $299 | Complete role-by-role analysis, savings breakdown, tool stack, 90-day timeline |
| Implementation Guide | $999 | Step-by-step setup instructions, vendor intros, integration playbooks |
| Managed Implementation | $4,999/mo | Groundwork's team implements the AI stack — hands-on, done-for-you |

The free tier is the viral loop. You see "AI could save your business $180K/year" and you're buying the $299 report.

## Target Customer

- Small-to-medium business owners (5–200 employees)
- $500K–$20M annual revenue
- Non-technical — they don't have a CTO or AI team
- Know AI is important, overwhelmed by options
- Industries: construction, professional services, agencies, e-commerce, healthcare, real estate, manufacturing

## How It Works (User Flow)

1. **Landing page** → Single input: "Enter your business name to start..."
2. **15-question conversational flow** (one question at a time, not a form):
   - Business name, industry, team size, revenue
   - Roles in the business (multi-select)
   - Biggest bottleneck (free text + suggestion chips)
   - Repetitive tasks (free text + chips)
   - Monthly payroll, tech-savviness, AI experience
   - "If you got 10 hours back, what would you do?"
   - Current tools, software budget, timeline
   - Email for report delivery
3. **Completion animation** → "Building your report..."
4. **AI-generated report** via Claude API → rendered on `/report` page
5. **Upsell CTAs** at bottom: $299 full plan / $4,999/mo managed

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 + CSS custom properties
- **Fonts:** Instrument Sans (body) + Source Serif 4 (display/headings)
- **Design:** Warm gray background (#f8f8f7), white cards, minimal, OpenAI/Manus-inspired
- **AI Backend:** Claude API (claude-sonnet-4-20250514) via `/api/generate-report` route
- **Hosting:** Vercel — deployed at `groundwork-steel-six.vercel.app`
- **Repo:** `masonkane/groundwork` on GitHub

## Current State (as of Feb 21, 2026)

### Built & Deployed ✅
- Landing page with inline business name input
- Full 15-question conversational questionnaire (text, pick, multi-select, long-text with chips)
- Back navigation, progress bar, step counter
- Completion animation screen
- `/api/generate-report` — takes answers, builds detailed Claude prompt, returns markdown report
- `/report` page — loading state, markdown→HTML renderer, PDF export, upsell CTAs
- Questionnaire→report wiring via sessionStorage

### Needs ⚠️
- **ANTHROPIC_API_KEY** environment variable in Vercel (report generation won't work without it)
- Payment integration (Stripe) for $299 report tier
- Email delivery of reports
- Free tier vs paid tier gating (currently generates full report for everyone)
- Analytics / conversion tracking
- SEO / meta tags for sharing
- Mobile polish pass

## Design System

```css
/* Colors */
--bg: #f8f8f7          /* warm gray background */
--surface: #FFFFFF       /* card/input backgrounds */
--fg: #1a1a1a           /* primary text */
--fg-secondary: #555    /* body text */
--fg-tertiary: #999     /* labels, hints */
--fg-ghost: #bbb        /* placeholders */
--border: rgba(0,0,0,0.08)
--accent: #1a1a1a       /* buttons, active states */

/* Typography */
Body: Instrument Sans (400/500/600/700)
Display: Source Serif 4 (serif, for headings)

/* Radius */
Cards: 16px (--radius-lg)
Inputs: 20px (--radius-xl)
Buttons: 12-14px (--radius-md)
Pills/chips: 12px

/* Shadows */
Subtle, layered — xs through lg
Cards lift on hover (translateY(-1px) + shadow-sm)

/* Animations */
Enter: translateY(12px) → 0 with spring easing
Staggered delays: 50ms increments
Spring easing: cubic-bezier(0.16, 1, 0.3, 1)
```

## Questionnaire Structure

| # | ID | Question | Type | Notes |
|---|-----|----------|------|-------|
| 1 | name | Business name | text | Also captured on landing page |
| 2 | industry | Industry | pick | 13 options |
| 3 | size | Team size | pick | Just me → 200+ |
| 4 | rev | Annual revenue | pick | Under $100K → $20M+ |
| 5 | roles | Roles in business | multi | 15 role options |
| 6 | bottleneck | Where losing most time | long | 6 suggestion chips |
| 7 | repetitive | Groundhog day tasks | long | 7 suggestion chips |
| 8 | payroll | Monthly payroll | pick | Under $10K → $250K+ |
| 9 | tech | Tech-savviness | pick | Paper → developers on staff |
| 10 | ai_exp | AI experience | pick | Haven't touched → deeply integrated |
| 11 | time | 10 hours back goal | long | 5 chips |
| 12 | tools | Current software | long | 6 chips |
| 13 | budget | Monthly software budget | pick | Under $500 → Whatever delivers ROI |
| 14 | speed | Implementation timeline | pick | Yesterday → just exploring |
| 15 | email | Email for report | text | — |

## Report Structure (AI-Generated)

The Claude prompt generates 8 sections:
1. **Executive Summary** — 3-4 sentences, total savings, highest-impact opportunity
2. **Role-by-Role Analysis** — for each role: AI replacement level, specific tasks, recommended tool, monthly cost, savings, implementation difficulty
3. **Total Savings Breakdown** — annual payroll estimate, projected savings with range, net ROI, payback period
4. **Bottleneck Solution** — 3-step fix for their specific bottleneck
5. **Quick Wins (Top 3)** — implementable this week, exact tools + costs + setup time
6. **90-Day Implementation Timeline** — week-by-week action plan
7. **Recommended Tool Stack** — table: tool, purpose, cost, what it replaces
8. **Risk Assessment** — what shouldn't be automated, risks, mitigations

## File Structure

```
groundwork/
├── src/app/
│   ├── layout.tsx          # Root layout, metadata
│   ├── page.tsx            # Landing + questionnaire + completion (single-page app)
│   ├── globals.css         # Design tokens, animations, component styles
│   ├── report/
│   │   └── page.tsx        # Report display page (markdown renderer, PDF export, CTAs)
│   └── api/
│       └── generate-report/
│           └── route.ts    # Claude API call, prompt builder, payroll estimation
├── public/
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Competitive Landscape

- **No direct competitor** at this price/speed point for SMBs
- Adjacent: generic AI consulting blogs (free, not specific), big consulting firms ($200K+), AI tool directories (no analysis)
- Closest: some agencies offer "AI audits" but they're manual, slow, and $5K+
- Groundwork's edge: instant, specific to YOUR business, fraction of the cost

## Brand Voice

- Direct, confident, no corporate speak
- Premium but approachable — not stuffy
- The vibe of someone who actually knows what they're talking about
- No hype, no "revolutionary AI" — just "here's what AI does for your specific business"

## Key Context for AI Agents

- This is a Next.js 15 app with App Router (not Pages Router)
- Tailwind v4 (import-based, not config-based)
- All styling uses CSS custom properties defined in globals.css
- The questionnaire is a single-page client component (page.tsx) with state-driven screens
- Report generation requires ANTHROPIC_API_KEY env var in Vercel
- Design philosophy: minimal, warm, Manus/OpenAI-inspired — white surfaces on warm gray, no color accents, typography-driven hierarchy
- Josh is extremely detail-oriented on UI — pixel-level polish matters
- When making changes: maintain the animation system, spring easings, staggered delays
- Never add color accents or gradients — the palette is intentionally monochrome with warm undertones
