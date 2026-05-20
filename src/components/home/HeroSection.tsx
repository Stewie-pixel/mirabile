import { Link } from 'react-router';
import { ArrowRight, LayoutDashboard, Map } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ReactiveOrb } from '@/components/home/Interactiveorb';

const T = {
  bg:      '#000000',
  grad:    'linear-gradient(135deg, #0AFFE4 0%, #0EA5E9 100%)',
  border:  'rgba(10,255,228,0.12)',
  surface: 'rgba(10,255,228,0.05)',
  textHigh: '#E8FFFE',
  textMid:  'rgba(232,255,254,0.55)',
  teal:    '#0AFFE4',
  cyan:    '#0EA5E9',
} as const;

export function HeroSection() {
  const { user } = useAuth();

  return (
    <>
      <style>{`
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .hf1 { animation: hero-fade-up 0.65s ease forwards; }
        .hf2 { animation: hero-fade-up 0.65s ease 0.15s forwards; opacity: 0; }
        .hf3 { animation: hero-fade-up 0.65s ease 0.28s forwards; opacity: 0; }
        .hf4 { animation: hero-fade-up 0.65s ease 0.42s forwards; opacity: 0; }
        .hf5 { animation: hero-fade-up 0.65s ease 0.55s forwards; opacity: 0; }
      `}</style>

      <section
        className="relative overflow-hidden"
        style={{ background: T.bg, minHeight: '92vh' }}
      >
        {/* Radial teal glow — top-right quadrant */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 60% 55% at 72% 40%, rgba(10,255,228,0.07) 0%, transparent 65%),
              radial-gradient(ellipse 40% 40% at 15% 75%, rgba(14,165,233,0.06) 0%, transparent 55%)
            `,
          }}
        />

        {/* Subtle dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(10,255,228,0.07) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
          }}
        />

        <div className="relative z-10 container mx-auto max-w-6xl px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-14 md:gap-8">

          {/* ── Left: copy */}
          <div className="flex-1 flex flex-col space-y-7">

            {/* Brand pill */}
            <div className="hf1 flex items-center gap-3">
              <img src="/images/logo.png" alt="Mirabile" className="h-20 w-20 object-contain" />
            </div>

            {/* Headline */}
            <div className="hf2">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                style={{ color: T.textHigh, letterSpacing: '-0.03em' }}
              >
                Your AI-Powered
                <span
                  className="block"
                  style={{
                    background: T.grad,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Career Roadmap
                </span>
                <span
                  className="block"
                  style={{ color: 'rgba(232,255,254,0.75)' }}
                >
                  to Top Tech Companies
                </span>
              </h1>
            </div>

            {/* Sub-copy */}
            <p
              className="hf3 text-base md:text-lg max-w-xl leading-relaxed"
              style={{ color: T.textMid }}
            >
              Generate personalised career roadmaps, access curated resources, and track your progress
              toward landing your dream job at{' '}
              <span style={{ color: T.teal, fontWeight: 600 }}>Google, Meta, Amazon</span>, and more.
            </p>

            {/* CTAs */}
            <div className="hf4 flex flex-col sm:flex-row gap-3 pt-1">
              {user ? (
                <>
                  <Link
                    to="/generator"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                    style={{
                      background: T.grad,
                      color: '#040810',
                      boxShadow: '0 0 32px rgba(10,255,228,0.22)',
                    }}
                  >
                    <Map className="w-4 h-4" />
                    Generate Your Roadmap
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
                    style={{
                      color: T.textHigh,
                      border: `1px solid ${T.border}`,
                      background: T.surface,
                      backdropFilter: 'blur(8px)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(10,255,228,0.32)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = T.border;
                    }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    View Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                    style={{
                      background: T.grad,
                      color: '#040810',
                      boxShadow: '0 0 32px rgba(10,255,228,0.22)',
                    }}
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
                    style={{
                      color: T.textHigh,
                      border: `1px solid ${T.border}`,
                      background: T.surface,
                      backdropFilter: 'blur(8px)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(10,255,228,0.32)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = T.border;
                    }}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="hf5 flex items-center gap-4 pt-1">
              <div className="flex -space-x-2">
                {(['#0AFFE4', '#0EA5E9', '#0284C7', '#075985'] as const).map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold"
                    style={{
                      borderColor: T.bg,
                      background: c,
                      color: '#040810',
                    }}
                  >
                    {['JL', 'MR', 'AK', 'ST'][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: T.textMid }}>
                Joined by{' '}
                <span style={{ color: T.textHigh, fontWeight: 600 }}>2,400+ engineers</span>{' '}
                this month
              </p>
            </div>
          </div>

          {/* ── Right: orb */}
          <div className="flex-1 flex items-center justify-center relative float">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 60% 50%, rgba(10,255,228,0.08), transparent 60%)',
              }}
            />
            <ReactiveOrb />
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent, ${T.bg})`,
          }}
        />
      </section>
    </>
  );
}