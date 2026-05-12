import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How does Mirabile generate my career roadmap?',
    a: 'Mirabile uses advanced AI to analyse your current skill level, your target company, and your available timeline. It then generates a step-by-step plan covering the exact topics to study, resources to use, and milestones to hit — all personalised to you. No two roadmaps are the same.',
  },
  {
    q: 'Which companies are supported?',
    a: 'We currently support roadmaps for Google, Meta, Amazon, Microsoft, Apple, Netflix, Stripe, Airbnb, Uber, Spotify, LinkedIn, and Salesforce — with more being added every month. If your target company isn\'t listed yet, our AI can still generate a general FAANG-style roadmap that prepares you for any top tech role.',
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
      style={{ background: 'linear-gradient(180deg, #030e1c 0%, #020c1b 100%)' }}
    >
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
            style={{
              color: '#38bdf8',
              background: 'rgba(56,189,248,0.1)',
              border: '1px solid rgba(56,189,248,0.2)',
              letterSpacing: '0.18em',
            }}
          >
            FAQ
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ letterSpacing: '-0.02em' }}
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
                  background: isOpen ? 'rgba(14,36,64,0.7)' : 'rgba(255,255,255,0.02)',
                  border: isOpen
                    ? '1px solid rgba(56,189,248,0.2)'
                    : '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span
                    className="text-sm md:text-base font-semibold"
                    style={{ color: isOpen ? '#7dd3fc' : 'rgba(186,230,255,0.85)' }}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
                    style={{
                      color: isOpen ? '#38bdf8' : 'rgba(148,213,252,0.4)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? 300 : 0 }}
                >
                  <p
                    className="px-6 pb-5 text-sm leading-relaxed"
                    style={{ color: 'rgba(148,213,252,0.6)' }}
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