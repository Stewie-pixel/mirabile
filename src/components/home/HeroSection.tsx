import { Link } from 'react-router';
import { ArrowRight, LayoutDashboard, Map } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { InteractiveOrb } from '@/components/home/Interactiveorb';

export function HeroSection() {
  const { user } = useAuth();

  return (
    <>
      <style>{`
        @keyframes orb-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-1 { animation: hero-fade-up 0.7s ease forwards; }
        .hero-fade-2 { animation: hero-fade-up 0.7s ease 0.15s forwards; opacity: 0; }
        .hero-fade-3 { animation: hero-fade-up 0.7s ease 0.3s  forwards; opacity: 0; }
        .hero-fade-4 { animation: hero-fade-up 0.7s ease 0.45s forwards; opacity: 0; }
      `}</style>

      <section
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #020c1b 0%, #0a2540 30%, #0c3b6e 60%, #0e4d8a 80%, #0369a1 100%)',
          minHeight: '92vh',
        }}
      >
        {/* Background radial glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 70% 50%, rgba(14,116,144,0.25) 0%, transparent 60%),
              radial-gradient(ellipse 40% 60% at 10% 80%, rgba(56,189,248,0.1) 0%, transparent 50%)
            `,
          }}
        />

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,213,252,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,213,252,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Two-column layout */}
        <div className="relative z-10 container mx-auto max-w-6xl px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-12 md:gap-8">

          {/* Left: copy */}
          <div className="flex-1 flex flex-col space-y-7 text-white">

            <div className="hero-fade-1 flex items-center gap-3">
              <img src="/images/logo.png" alt="Mirabile" className="h-10 w-10 object-contain" />
              <span
                className="text-sm font-semibold uppercase text-sky-300 opacity-90"
                style={{ letterSpacing: '0.18em' }}
              >
                Mirabile
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium text-sky-200 border border-sky-400/30"
                style={{ background: 'rgba(56,189,248,0.12)' }}
              >
                AI-Powered
              </span>
            </div>

            <div className="hero-fade-2">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white"
                style={{ letterSpacing: '-0.02em' }}
              >
                Your AI-Powered
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(90deg, #7dd3fc, #38bdf8, #0ea5e9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Career Roadmap
                </span>
                <span className="block text-white/90">to Top Tech Companies</span>
              </h1>
            </div>

            <p className="hero-fade-3 text-base md:text-lg text-sky-100/70 max-w-xl leading-relaxed">
              Generate personalized career roadmaps, access curated resources, and track your progress
              toward landing your dream job at{' '}
              <span className="text-sky-300 font-medium">Google, Meta, Amazon</span>, and more.
            </p>

            <div className="hero-fade-4 flex flex-col sm:flex-row gap-3 pt-2">
              {user ? (
                <>
                  <Link
                    to="/generator"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 60%, #0369a1 100%)',
                      boxShadow: '0 4px 24px rgba(14,165,233,0.45), 0 1px 0 rgba(255,255,255,0.1) inset',
                    }}
                  >
                    <Map className="w-4 h-4" />
                    Generate Your Roadmap
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-sky-200 border border-sky-400/30 transition-all duration-200 hover:bg-sky-400/10 hover:border-sky-300/50 hover:text-white active:scale-[0.98]"
                    style={{ backdropFilter: 'blur(8px)' }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    View Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 60%, #0369a1 100%)',
                      boxShadow: '0 4px 24px rgba(14,165,233,0.45), 0 1px 0 rgba(255,255,255,0.1) inset',
                    }}
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-sky-200 border border-sky-400/30 transition-all duration-200 hover:bg-sky-400/10 hover:border-sky-300/50 hover:text-white active:scale-[0.98]"
                    style={{ backdropFilter: 'blur(8px)' }}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="hero-fade-4 flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {(['#0ea5e9', '#0284c7', '#0369a1', '#075985'] as const).map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-[#0a2540] flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ background: c }}
                  >
                    {['JL', 'MR', 'AK', 'ST'][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-sky-300/70">
                Joined by <span className="text-sky-200 font-semibold">2,400+ engineers</span> this month
              </p>
            </div>
          </div>

          {/* Right: 3D dot-sphere orb */}
          <div className="flex-1 flex items-center justify-center w-full">
            <InteractiveOrb />
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(2,12,27,0.6))' }}
        />
      </section>
    </>
  );
}