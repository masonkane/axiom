import { NextRequest, NextResponse } from 'next/server';

/* ── Types ── */
interface Answers {
  name: string;
  industry: string;
  size: string;
  rev: string;
  roles: string | string[];
  bottleneck: string;
  repetitive: string;
  payroll: string;
  tech: string;
  ai_exp: string;
  time: string;
  tools: string;
  budget: string;
  speed: string;
  email: string;
}

/* ── Payroll → annual estimate ── */
function estimateAnnualPayroll(payroll: string): number {
  const map: Record<string, number> = {
    'Under $10K': 8000 * 12,
    '$10K–$25K': 17500 * 12,
    '$25K–$50K': 37500 * 12,
    '$50K–$100K': 75000 * 12,
    '$100K–$250K': 175000 * 12,
    '$250K+': 350000 * 12,
    'Not sure': 50000 * 12,
  };
  return map[payroll] ?? 600000;
}

/* ── Build the Claude prompt ── */
function buildPrompt(a: Answers): string {
  const roles = Array.isArray(a.roles) ? a.roles.join(', ') : a.roles;
  const annualPayroll = estimateAnnualPayroll(a.payroll);

  return `You are an elite AI implementation consultant. Generate a comprehensive, specific, actionable AI implementation report for this business. Be direct, concrete, and honest — no fluff, no generic advice.

## Business Profile
- **Company:** ${a.name}
- **Industry:** ${a.industry}
- **Team size:** ${a.size}
- **Annual revenue:** ${a.rev}
- **Roles:** ${roles}
- **Biggest bottleneck:** ${a.bottleneck}
- **Repetitive tasks:** ${a.repetitive}
- **Monthly payroll:** ${a.payroll} (est. $${(annualPayroll).toLocaleString()}/yr)
- **Tech level:** ${a.tech}
- **AI experience:** ${a.ai_exp}
- **10 hrs back goal:** ${a.time}
- **Current tools:** ${a.tools}
- **Software budget:** ${a.budget}
- **Timeline:** ${a.speed}

## Report Structure (follow exactly)

### 1. Executive Summary (3-4 sentences)
One paragraph: what AI can do for THIS specific business, estimated annual savings range, and the single highest-impact opportunity.

### 2. Role-by-Role Analysis
For EACH role they listed, provide:
- **Role name**
- **AI Replacement Level:** Full (>80%), Partial (40-80%), Augmented (10-40%), Minimal (<10%)
- **Specific tasks AI handles** (be precise to their industry)
- **Recommended tool** (real product name, not generic)
- **Monthly cost** of the tool
- **Monthly savings** (salary offset minus tool cost)
- **Implementation difficulty:** Easy / Medium / Hard

### 3. Total Savings Breakdown
- Current annual payroll estimate: $X
- Projected annual savings: $X (with range)
- Net ROI after tool costs
- Payback period

### 4. Bottleneck Solution
Address their specific bottleneck with a concrete 3-step fix using AI tools.

### 5. Quick Wins (Top 3)
Three things they can implement THIS WEEK with minimal effort. Include exact tool names, costs, and setup time.

### 6. 90-Day Implementation Timeline
- **Days 1-7:** Quick wins (list specific actions)
- **Days 8-30:** Core automation (list specific tools + integrations)
- **Days 31-60:** Advanced workflows (list specific processes)
- **Days 61-90:** Optimization + scaling

### 7. Recommended Tool Stack
Table format: Tool → Purpose → Monthly Cost → Replaces What
Only recommend REAL tools that exist. Include pricing.

### 8. Risk Assessment
- What SHOULDN'T be automated (and why)
- Biggest implementation risks for their specific situation
- How to mitigate each risk

Format the entire report in clean markdown. Use actual dollar amounts, real tool names, and specific-to-their-industry advice. No generic filler.`;
}

/* ── API Route ── */
export async function POST(req: NextRequest) {
  try {
    const { answers } = (await req.json()) as { answers: Answers };

    if (!answers?.email || !answers?.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const prompt = buildPrompt(answers);

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Claude API error:', err);
      return NextResponse.json({ error: 'Report generation failed' }, { status: 502 });
    }

    const data = await response.json();
    const report = data.content?.[0]?.text ?? '';

    return NextResponse.json({
      success: true,
      report,
      business: answers.name,
      email: answers.email,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Generate report error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
