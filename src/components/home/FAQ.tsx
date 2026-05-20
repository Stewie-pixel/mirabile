import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const T = {
  bg:       '#000000',
  grad:     'linear-gradient(135deg, #00F0FF 0%, #F472B6 100%)',
  border:   'rgba(0,240,255,0.12)',
  surface:  'rgba(0,240,255,0.04)',
  surface2: 'rgba(0,240,255,0.07)',
  textHigh: '#E8FFFE',
  textMid:  'rgba(232,255,254,0.55)',
  textLow:  'rgba(232,255,254,0.35)',
  teal:     '#00F0FF',
  cyan:     '#F472B6',
} as const;

const FAQS = [
  {
    q: 'How does Mirabile generate my career roadmap?',
    a: 'Mirabile uses advanced AI to analyse your current skill level, your target company, and your available timeline. It then generates a step-by-step plan covering the exact topics to study, resources to use, and milestones to hit — all personalised to you. No two roadmaps are the same.',
  },
  {
    q: 'Which companies are supported?',
    a: 'We currently support roadmaps for Google, Meta, Amazon, Microsoft, Apple, Netflix, Stripe, Airbnb, Uber, Spotify, LinkedIn, and Salesforce — with more being added every month. If your target company isn’t listed yet, our AI can still generate a general FAANG-style roadmap that prepares you for any top tech role.',
  },
  {
    q: 'Is Mirabile free to use?',
    a: 'You can generate your first full roadmap for free with no credit card required. A Pro plan unlocks unlimited roadmap generations, priority AI responses, advanced progress tracking, and access to our curated resource library with 500+ hand-picked study materials.',
  },
  {
    q: 'How long does it take to see results?',
    a: 'Most users who follow their roadmap consistently report landing interviews within 4–8 months, and offers within 6–12 months. Results depend on your starting point and the time you invest — but our AI optimises the plan so every hour you spend is directed at what actually moves the needle for your target company.',
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      className="py-20 px-4"
      style={{
        background: T.bg,
      }}
    >
      <div className="container mx-auto max-w-2xl">

        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
            style={{
              color: T.teal,
              background: T.surface,
              border: `1px solid ${T.border}`,
            }}
          >
            FAQ
          </span>

          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{
              color: T.textHigh,
              letterSpacing: '-0.02em',
            }}
          >
            Frequently asked questions
          </h2>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;

            return (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: isOpen ? T.surface2 : T.surface,
                  border: isOpen
                    ? `1px solid ${T.cyan}`
                    : `1px solid ${T.border}`,
                  backdropFilter: 'blur(14px)',
                }}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span
                    className="text-sm md:text-base font-semibold transition-colors"
                    style={{
                      color: isOpen ? T.teal : T.textHigh,
                    }}
                  >
                    {faq.q}
                  </span>

                  <ChevronDown
                    className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
                    style={{
                      color: isOpen ? T.teal : T.textLow,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: isOpen ? 300 : 0,
                  }}
                >
                  <p
                    className="px-6 pb-5 text-sm leading-relaxed"
                    style={{
                      color: T.textMid,
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}