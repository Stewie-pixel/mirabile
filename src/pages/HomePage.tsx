import { Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Target, TrendingUp, Award } from 'lucide-react';

import { HeroSection } from '@/components/home/HeroSection';
import { CompanyMarquee } from '@/components/home/CompanyMarquee';
import { AIChatMockup } from '@/components/home/AIChatMockup';
import { FAQSection } from '@/components/home/FAQ';

const TOKENS = {
  bg: '#000000',
  gradText: 'linear-gradient(135deg, #0AFFE4 0%, #0EA5E9 100%)',
  gradBtn: 'linear-gradient(135deg, #0AFFE4 0%, #0EA5E9 100%)',
  surface: 'rgba(10,255,228,0.04)',
  surfaceHover: 'rgba(10,255,228,0.09)',
  border: 'rgba(10,255,228,0.12)',
  borderHover: 'rgba(10,255,228,0.32)',
  textHigh: '#E8FFFE',
  textMid: 'rgba(232,255,254,0.55)',
  badge: {
    bg: 'rgba(10,255,228,0.07)',
    border: 'rgba(10,255,228,0.18)',
    color: '#0AFFE4',
  },
} as const;

function GradText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={className}
      style={{
        background: TOKENS.gradText,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </span>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span
      className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
      style={{
        color: TOKENS.badge.color,
        background: TOKENS.badge.bg,
        border: `1px solid ${TOKENS.badge.border}`,
        letterSpacing: '0.18em',
        fontFamily: "'DM Mono', monospace",
      }}
    >
      {label}
    </span>
  );
}

function WhySection() {
  const cards = [
    {
      icon: Target,
      title: 'AI-Powered Roadmaps',
      body: 'Get personalized career roadmaps tailored to your target company and timeline, powered by advanced AI.',
    },
    {
      icon: TrendingUp,
      title: 'Curated Resources',
      body: 'Access high-quality learning materials, practice problems, and company-specific interview prep.',
    },
    {
      icon: Award,
      title: 'Progress Tracking',
      body: 'Track your progress, maintain streaks, and achieve milestones on your journey to success.',
    },
  ];

  return (
    <section
      className="py-24 px-4 relative overflow-hidden"
      style={{ background: TOKENS.bg }}
    >
      {/* Subtle centered glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(14,165,233,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge label="Why Mirabile" />
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: TOKENS.textHigh, letterSpacing: '-0.02em' }}
          >
            Why Choose{' '}
            <GradText>Mirabile?</GradText>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map(({ icon: Icon, title, body }, i) => (
            <div
              key={i}
              className="group flex flex-col items-center text-center gap-5 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 cursor-default"
              style={{
                background: TOKENS.surface,
                border: `1px solid ${TOKENS.border}`,
                backdropFilter: 'blur(12px)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.border = `1px solid ${TOKENS.borderHover}`;
                el.style.background = TOKENS.surfaceHover;
                el.style.boxShadow = '0 0 32px rgba(10,255,228,0.06)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.border = `1px solid ${TOKENS.border}`;
                el.style.background = TOKENS.surface;
                el.style.boxShadow = 'none';
              }}
            >
              {/* Icon container with gradient border trick */}
              <div
                className="p-[1px] rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(10,255,228,0.5) 0%, rgba(14,165,233,0.5) 100%)',
                }}
              >
                <div
                  className="p-4 rounded-2xl"
                  style={{ background: '#080C10' }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{
                      stroke: 'url(#teal-grad)',
                      color: '#0AFFE4',
                    }}
                  />
                </div>
              </div>

              <h3
                className="text-base font-semibold"
                style={{ color: TOKENS.textHigh }}
              >
                {title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: TOKENS.textMid }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { user } = useAuth();

  return (
    <section
      className="py-24 px-4 relative overflow-hidden"
      style={{ background: TOKENS.bg }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 55% at 50% 50%, rgba(10,255,228,0.07) 0%, transparent 65%)',
        }}
      />

      {/* Thin divider line at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(10,255,228,0.3), transparent)',
        }}
      />

      <div className="relative z-10 container mx-auto max-w-3xl text-center">
        <Badge label="Get Started" />

        <h2
          className="text-3xl md:text-5xl font-bold mb-5"
          style={{ color: TOKENS.textHigh, letterSpacing: '-0.03em', lineHeight: 1.15 }}
        >
          Ready to Start{' '}
          <GradText>Your Journey?</GradText>
        </h2>

        <p
          className="text-base mb-10 max-w-xl mx-auto"
          style={{ color: TOKENS.textMid, lineHeight: 1.7 }}
        >
          Join thousands of professionals who have successfully landed their dream jobs with Mirabile.
        </p>

        <Link
          to={user ? '/generator' : '/register'}
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: TOKENS.gradBtn,
            color: '#040810',
            boxShadow: '0 0 40px rgba(10,255,228,0.25), 0 2px 0 rgba(255,255,255,0.08) inset',
            fontWeight: 700,
            letterSpacing: '0.01em',
          }}
        >
          {user ? 'Create Your Roadmap' : 'Sign Up Now'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: TOKENS.bg }}
    >
      {/* Hidden SVG gradient def for Lucide icons that support stroke gradients */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="teal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0AFFE4" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
      </svg>

      <HeroSection />
      <WhySection />
      <CompanyMarquee />
      <AIChatMockup />
      <CTASection />
      <FAQSection />
    </div>
  );
}