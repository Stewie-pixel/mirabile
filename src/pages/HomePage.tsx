import { Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Target, TrendingUp, Award } from 'lucide-react';

import { HeroSection } from '@/components/home/HeroSection';
import { CompanyMarquee } from '@/components/home/CompanyMarquee';
import { AIChatMockup } from '@/components/home/AIChatMockup';
import { FAQSection } from '@/components/home/Faq';

function WhySection() {
  const cards = [
    {
      icon: <Target className="h-7 w-7" style={{ color: '#38bdf8' }} />,
      title: 'AI-Powered Roadmaps',
      body: 'Get personalized career roadmaps tailored to your target company and timeline, powered by advanced AI.',
    },
    {
      icon: <TrendingUp className="h-7 w-7" style={{ color: '#38bdf8' }} />,
      title: 'Curated Resources',
      body: 'Access high-quality learning materials, practice problems, and company-specific interview prep.',
    },
    {
      icon: <Award className="h-7 w-7" style={{ color: '#38bdf8' }} />,
      title: 'Progress Tracking',
      body: 'Track your progress, maintain streaks, and achieve milestones on your journey to success.',
    },
  ];

  return (
    <section
      className="py-20 px-4"
      style={{ background: 'linear-gradient(180deg, #020c1b 0%, #030e1c 100%)' }}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
            style={{
              color: '#38bdf8',
              background: 'rgba(56,189,248,0.1)',
              border: '1px solid rgba(56,189,248,0.2)',
              letterSpacing: '0.18em',
            }}
          >
            Why Mirabile
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            Why Choose Mirabile?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(56,189,248,0.1)',
                backdropFilter: 'blur(12px)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(56,189,248,0.25)';
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(14,36,64,0.5)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(56,189,248,0.1)';
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
              }}
            >
              <div
                className="p-4 rounded-2xl"
                style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' }}
              >
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(148,213,252,0.55)' }}>
                {card.body}
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
      className="py-20 px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #020c1b 0%, #020c1b 100%)' }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(14,116,144,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 container mx-auto max-w-3xl text-center">
        <span
          className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
          style={{
            color: '#38bdf8',
            background: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.2)',
            letterSpacing: '0.18em',
          }}
        >
          Get Started
        </span>
        <h2
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          style={{ letterSpacing: '-0.02em' }}
        >
          Ready to Start Your Journey?
        </h2>
        <p className="text-base mb-10" style={{ color: 'rgba(148,213,252,0.55)' }}>
          Join thousands of professionals who have successfully landed their dream jobs with Mirabile.
        </p>

        <Link
          to={user ? '/generator' : '/register'}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 60%, #0369a1 100%)',
            boxShadow: '0 4px 32px rgba(14,165,233,0.4), 0 1px 0 rgba(255,255,255,0.1) inset',
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
    <div className="flex min-h-screen flex-col" style={{ background: '#020c1b' }}>
      <HeroSection />
      <WhySection />
      <CompanyMarquee />
      <AIChatMockup />
      <CTASection />
      <FAQSection />
    </div>
  );
}